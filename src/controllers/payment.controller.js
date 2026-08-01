import crypto from 'crypto';
import { Payment, Order, LebalmaInstallment, LebalmaContract } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { PAYMENT_STATUS, INSTALLMENT_STATUS } from '../utils/constants.js';
import { providerMode } from '../config/payments.js';
import {
  createCheckout,
  verifyWaveSignature,
  applyPaymentSuccess,
  applyPaymentFailure,
} from '../services/payment.service.js';

const GATEWAY_METHODS = ['wave', 'orange_money', 'card'];

/**
 * POST /api/payments  { purpose:'order'|'installment', referenceId, method }
 * Crée une transaction et renvoie l'URL de redirection vers la passerelle
 * (ou le simulateur en dev). La confirmation vient du webhook / simulateur.
 */
export const initiatePayment = asyncHandler(async (req, res) => {
  const { purpose = 'order', referenceId, method } = req.body;
  if (!GATEWAY_METHODS.includes(method)) {
    return fail(res, { status: 400, message: 'Moyen de paiement non pris en charge par la passerelle' });
  }

  let amount;
  let orderId = null;
  let installmentId = null;

  if (purpose === 'order') {
    const order = await Order.findOne({ where: { id: referenceId, userId: req.user.id } });
    if (!order) return fail(res, { status: 404, message: 'Commande introuvable' });
    if (order.paymentStatus === PAYMENT_STATUS.SUCCESS) {
      return fail(res, { status: 400, message: 'Commande déjà payée' });
    }
    amount = order.total;
    orderId = order.id;
  } else if (purpose === 'installment') {
    const inst = await LebalmaInstallment.findByPk(referenceId, {
      include: [{ model: LebalmaContract, as: 'contract' }],
    });
    if (!inst || inst.contract?.userId !== req.user.id) {
      return fail(res, { status: 404, message: 'Échéance introuvable' });
    }
    if (inst.status === INSTALLMENT_STATUS.PAID) {
      return fail(res, { status: 400, message: 'Échéance déjà réglée' });
    }
    amount = inst.amount;
    installmentId = inst.id;
  } else {
    return fail(res, { status: 400, message: 'Objet de paiement invalide' });
  }

  const idempotencyKey = `PAY-${purpose}-${referenceId}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const payment = await Payment.create({
    userId: req.user.id,
    orderId,
    installmentId,
    purpose,
    method,
    provider: providerMode(method) === 'live' ? method : 'simulation',
    amount,
    status: PAYMENT_STATUS.PENDING,
    idempotencyKey,
  });

  let checkout;
  try {
    checkout = await createCheckout(payment);
  } catch (e) {
    await payment.update({ status: PAYMENT_STATUS.FAILED, rawResponse: { error: e.message } });
    return fail(res, { status: 502, message: 'Passerelle de paiement indisponible' });
  }
  await payment.update({ providerRef: checkout.providerRef });

  return created(res, {
    message: 'Paiement initié',
    data: {
      paymentId: payment.id,
      checkoutUrl: checkout.checkoutUrl,
      mode: providerMode(method),
      amount,
    },
  });
});

/**
 * POST /api/payments/webhook/:provider  (PUBLIC)
 * Confirmation définitive de la passerelle. La signature est vérifiée.
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const raw = req.rawBody?.toString('utf8') || '';

  if (provider === 'wave') {
    if (!verifyWaveSignature(raw, req.headers['wave-signature'])) {
      return fail(res, { status: 400, message: 'Signature invalide' });
    }
    const event = req.body || {};
    const providerRef = event.data?.id || event.data?.checkout_session_id;
    const payment = providerRef ? await Payment.findOne({ where: { providerRef } }) : null;
    if (!payment) return success(res, { message: 'Ignoré' }); // 200 → pas de rejeu inutile

    if (event.type === 'checkout.session.completed' || event.data?.payment_status === 'succeeded') {
      await applyPaymentSuccess(payment);
    } else if (event.type === 'checkout.session.payment_failed') {
      await applyPaymentFailure(payment);
    }
    await payment.update({ rawResponse: event });
    return success(res, { message: 'Webhook traité' });
  }

  if (provider === 'orange_money') {
    const { order_id: orderRef, status, txnid } = req.body || {};
    const payment = orderRef ? await Payment.findOne({ where: { idempotencyKey: orderRef } }) : null;
    if (!payment) return success(res, { message: 'Ignoré' });
    const s = String(status || '').toUpperCase();
    if (s === 'SUCCESS') await applyPaymentSuccess(payment);
    else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(s)) await applyPaymentFailure(payment);
    await payment.update({ rawResponse: req.body, providerRef: txnid || payment.providerRef });
    return success(res, { message: 'Webhook traité' });
  }

  return fail(res, { status: 404, message: 'Passerelle inconnue' });
});

/**
 * POST /api/payments/:id/simulate  { outcome:'success'|'failure' }
 * DEV uniquement : disponible tant qu'aucune passerelle réelle n'est configurée.
 */
export const simulatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!payment) return fail(res, { status: 404, message: 'Paiement introuvable' });
  if (payment.provider !== 'simulation') {
    return fail(res, { status: 400, message: 'Simulation indisponible (passerelle réelle active)' });
  }
  if (req.body.outcome === 'success') await applyPaymentSuccess(payment);
  else await applyPaymentFailure(payment);
  return success(res, { message: 'Simulation appliquée', data: { status: payment.status } });
});

// GET /api/payments/:id  → statut d'un paiement (page de retour)
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!payment) return fail(res, { status: 404, message: 'Paiement introuvable' });
  return success(res, { data: payment });
});

// GET /api/payments  → historique de paiement de l'utilisateur
export const myPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: payments });
});
