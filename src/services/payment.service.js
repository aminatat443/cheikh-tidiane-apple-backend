import crypto from 'crypto';
import { Op } from 'sequelize';
import { paymentEnv, providerMode } from '../config/payments.js';
import { Order, LebalmaContract, LebalmaInstallment } from '../models/index.js';
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  INSTALLMENT_STATUS,
  LEBALMA_CONTRACT_STATUS,
} from '../utils/constants.js';
import { notifyUser } from '../sockets/index.js';
import { createNotification, notifyAllAdmins, fcfa } from './notification.service.js';

const CLIENT = paymentEnv.clientUrl;
const returnUrl = (status) => `${CLIENT}/paiement/retour?status=${status}`;

/**
 * Crée une session de paiement chez le provider et renvoie l'URL de redirection.
 * En simulation, l'URL pointe vers le simulateur local du frontend.
 */
export async function createCheckout(payment) {
  const mode = providerMode(payment.method);
  if (mode === 'live' && payment.method === 'wave') return createWaveCheckout(payment);
  if (mode === 'live' && payment.method === 'orange_money') return createOrangeCheckout(payment);
  return {
    checkoutUrl: `${CLIENT}/paiement/simulateur/${payment.id}`,
    providerRef: `SIM-${payment.id}`,
  };
}

// --- Wave Checkout API ---
async function createWaveCheckout(payment) {
  const res = await fetch(`${paymentEnv.wave.apiBase}/checkout/sessions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${paymentEnv.wave.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: String(payment.amount),
      currency: 'XOF',
      success_url: returnUrl('success'),
      error_url: returnUrl('error'),
      client_reference: payment.idempotencyKey,
    }),
  });
  if (!res.ok) throw new Error(`Wave ${res.status}`);
  const data = await res.json();
  return { checkoutUrl: data.wave_launch_url, providerRef: data.id };
}

// --- Orange Money Web Payment ---
async function orangeToken() {
  const auth = Buffer.from(`${paymentEnv.orange.clientId}:${paymentEnv.orange.clientSecret}`).toString('base64');
  const res = await fetch(paymentEnv.orange.tokenUrl, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Orange OAuth échoué');
  return (await res.json()).access_token;
}

async function createOrangeCheckout(payment) {
  const token = await orangeToken();
  const res = await fetch(`${paymentEnv.orange.apiBase}/webpayment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_key: paymentEnv.orange.merchantKey,
      currency: process.env.OM_CURRENCY || 'OUV', // 'OUV' en sandbox, 'XOF' en prod
      order_id: payment.idempotencyKey,
      amount: payment.amount,
      return_url: returnUrl('success'),
      cancel_url: returnUrl('error'),
      notif_url: `${paymentEnv.appUrl}/api/payments/webhook/orange_money`,
    }),
  });
  if (!res.ok) throw new Error(`Orange Money ${res.status}`);
  const data = await res.json();
  return { checkoutUrl: data.payment_url, providerRef: data.pay_token };
}

/** Vérifie la signature HMAC-SHA256 d'un webhook Wave ("Wave-Signature: t=..,v1=.."). */
export function verifyWaveSignature(rawBody, header) {
  if (!paymentEnv.wave.webhookSecret) return true; // pas de secret en dev → non exigé
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.trim().split('=')));
  const expected = crypto
    .createHmac('sha256', paymentEnv.wave.webhookSecret)
    .update(`${parts.t}.${rawBody}`)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(parts.v1 || ''), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Applique un paiement RÉUSSI (idempotent) : crédite la commande ou l'échéance
 * Lebalma et notifie client + admins. Sans effet si déjà « success ».
 */
export async function applyPaymentSuccess(payment) {
  if (payment.status === PAYMENT_STATUS.SUCCESS) return;
  await payment.update({ status: PAYMENT_STATUS.SUCCESS });

  if (payment.purpose === 'order' && payment.orderId) {
    const order = await Order.findByPk(payment.orderId);
    if (order && order.paymentStatus !== PAYMENT_STATUS.SUCCESS) {
      await order.update({ paymentStatus: PAYMENT_STATUS.SUCCESS, status: ORDER_STATUS.PAID });
      notifyUser(order.userId, 'payment:success', { orderId: order.id });
      await createNotification({
        userId: order.userId,
        type: 'order_paid',
        title: 'Paiement confirmé',
        message: `Le paiement de votre commande ${order.reference} (${fcfa(order.total)}) est confirmé.`,
        link: '/orders',
      });
      await notifyAllAdmins({
        type: 'order_paid',
        title: 'Commande payée',
        message: `Commande ${order.reference} réglée (${fcfa(order.total)}).`,
        link: '/admin/orders',
      });
    }
  }

  if (payment.purpose === 'installment' && payment.installmentId) {
    const inst = await LebalmaInstallment.findByPk(payment.installmentId);
    if (inst && inst.status !== INSTALLMENT_STATUS.PAID) {
      await inst.update({ status: INSTALLMENT_STATUS.PAID, paidAt: new Date() });
      const remaining = await LebalmaInstallment.count({
        where: { contractId: inst.contractId, status: { [Op.ne]: INSTALLMENT_STATUS.PAID } },
      });
      const contract = await LebalmaContract.findByPk(inst.contractId);
      if (contract) {
        await contract.update({
          status: remaining === 0 ? LEBALMA_CONTRACT_STATUS.COMPLETED : LEBALMA_CONTRACT_STATUS.ACTIVE,
        });
        await createNotification({
          userId: contract.userId,
          type: 'lebalma_installment',
          title: remaining === 0 ? 'Contrat Lebalma soldé' : 'Échéance réglée',
          message:
            remaining === 0
              ? `Votre contrat ${contract.reference} est entièrement réglé. Félicitations !`
              : `Échéance n°${inst.sequence} du contrat ${contract.reference} réglée (${fcfa(inst.amount)}).`,
          link: '/mes-financements',
        });
        await notifyAllAdmins({
          type: 'lebalma_installment',
          title: 'Échéance Lebalma payée',
          message: `Échéance n°${inst.sequence} — contrat ${contract.reference} (${fcfa(inst.amount)}).`,
          link: '/admin/lebalma',
        });
      }
    }
  }
}

/** Applique un paiement ÉCHOUÉ (idempotent). */
export async function applyPaymentFailure(payment) {
  if (payment.status === PAYMENT_STATUS.SUCCESS) return;
  await payment.update({ status: PAYMENT_STATUS.FAILED });
}
