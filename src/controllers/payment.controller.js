import { Payment, Order } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../utils/constants.js';
import { notifyUser } from '../sockets/index.js';

/**
 * POST /api/payments  { orderId, method }
 * Initie un paiement. ⚠️ Placeholder : ici on créerait la transaction chez la
 * passerelle (Wave / Orange Money / carte) et on renverrait l'URL/redirection.
 * La confirmation définitive DOIT venir du webhook signé (voir handleWebhook).
 */
export const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId, method } = req.body;

  const order = await Order.findOne({ where: { id: orderId, userId: req.user.id } });
  if (!order) return fail(res, { status: 404, message: 'Commande introuvable' });

  const payment = await Payment.create({
    orderId: order.id,
    userId: req.user.id,
    method,
    amount: order.total,
    status: PAYMENT_STATUS.PENDING,
  });

  // TODO: appel réel à la passerelle (CinetPay/PayDunya/Paystack/Wave/OM).
  const checkoutUrl = `https://gateway.example.com/pay/${payment.id}`;

  return created(res, {
    message: 'Paiement initié',
    data: { paymentId: payment.id, checkoutUrl },
  });
});

/**
 * POST /api/payments/webhook
 * Reçu depuis la passerelle. ⚠️ Vérifier la SIGNATURE (PAYMENT_WEBHOOK_SECRET)
 * avant de valider quoi que ce soit.
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  // TODO: vérifier la signature du webhook ici.
  const { paymentId, status, providerRef } = req.body;

  const payment = await Payment.findByPk(paymentId);
  if (!payment) return fail(res, { status: 404, message: 'Paiement introuvable' });

  payment.status = status === 'success' ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED;
  payment.providerRef = providerRef;
  payment.rawResponse = req.body;
  await payment.save();

  if (payment.status === PAYMENT_STATUS.SUCCESS && payment.orderId) {
    const order = await Order.findByPk(payment.orderId);
    if (order) {
      order.paymentStatus = PAYMENT_STATUS.SUCCESS;
      order.status = ORDER_STATUS.PAID;
      await order.save();
      notifyUser(order.userId, 'payment:success', { orderId: order.id });
    }
  }

  return success(res, { message: 'Webhook traité' });
});

// GET /api/payments  → historique de paiement de l'utilisateur
export const myPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: payments });
});
