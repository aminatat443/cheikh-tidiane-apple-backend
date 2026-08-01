import { Op } from 'sequelize';
import {
  sequelize,
  Order,
  OrderItem,
  ReturnRequest,
  ReturnItem,
  User,
} from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import {
  RETURN_STATUS,
  RETURNABLE_ORDER_STATUS,
  RETURN_WINDOW_DAYS,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from '../utils/constants.js';
import { createNotification, notifyAllAdmins, fcfa } from '../services/notification.service.js';

const RETURN_STATUS_LABELS = {
  requested: 'demande reçue',
  approved: 'approuvée',
  rejected: 'refusée',
  refunded: 'remboursée',
};

function genReference() {
  return `RET-${Date.now().toString(36).toUpperCase()}`;
}

/* =========================================================================
 *  CLIENT
 * ========================================================================= */

// POST /api/returns  { orderId, reason, items:[{ orderItemId, quantity }] }
export const createReturn = asyncHandler(async (req, res) => {
  const { orderId, reason, items } = req.body;

  if (!reason || !String(reason).trim()) {
    return fail(res, { status: 400, message: 'Le motif du retour est requis' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return fail(res, { status: 400, message: 'Sélectionnez au moins un article à retourner' });
  }

  const order = await Order.findOne({
    where: { id: orderId, userId: req.user.id },
    include: [{ model: OrderItem, as: 'items' }],
  });
  if (!order) return fail(res, { status: 404, message: 'Commande introuvable' });

  // Éligibilité : statut de commande + fenêtre de retour
  if (!RETURNABLE_ORDER_STATUS.includes(order.status)) {
    return fail(res, { status: 400, message: 'Cette commande n’est pas éligible à un retour' });
  }
  const daysSince = (Date.now() - new Date(order.createdAt).getTime()) / 86400000;
  if (daysSince > RETURN_WINDOW_DAYS) {
    return fail(res, {
      status: 400,
      message: `Le délai de retour de ${RETURN_WINDOW_DAYS} jours est dépassé`,
    });
  }

  // Une seule demande active (requested/approved) par commande
  const existing = await ReturnRequest.findOne({
    where: {
      orderId: order.id,
      status: { [Op.in]: [RETURN_STATUS.REQUESTED, RETURN_STATUS.APPROVED] },
    },
  });
  if (existing) {
    return fail(res, {
      status: 409,
      message: 'Une demande de retour est déjà en cours pour cette commande',
    });
  }

  // Valide les articles demandés contre la commande
  const orderItemsById = new Map(order.items.map((it) => [it.id, it]));
  const returnItems = [];
  let refundAmount = 0;

  for (const line of items) {
    const orderItem = orderItemsById.get(Number(line.orderItemId));
    if (!orderItem) {
      return fail(res, { status: 400, message: 'Article invalide pour cette commande' });
    }
    const qty = Math.min(Math.max(Number(line.quantity) || 1, 1), orderItem.quantity);
    refundAmount += orderItem.unitPrice * qty;
    returnItems.push({
      orderItemId: orderItem.id,
      productName: orderItem.productName,
      unitPrice: orderItem.unitPrice,
      quantity: qty,
      color: orderItem.color,
      storage: orderItem.storage,
    });
  }

  const request = await sequelize.transaction(async (t) => {
    const rr = await ReturnRequest.create(
      {
        reference: genReference(),
        userId: req.user.id,
        orderId: order.id,
        reason: String(reason).trim(),
        status: RETURN_STATUS.REQUESTED,
        refundAmount,
      },
      { transaction: t }
    );
    for (const it of returnItems) {
      await ReturnItem.create({ returnRequestId: rr.id, ...it }, { transaction: t });
    }
    return rr;
  });

  await notifyAllAdmins({
    type: 'return_new',
    title: 'Nouvelle demande de retour',
    message: `Retour ${request.reference} sur la commande ${order.reference} — ${fcfa(refundAmount)}`,
    link: '/admin/returns',
  });
  await createNotification({
    userId: req.user.id,
    type: 'return_new',
    title: 'Demande de retour enregistrée',
    message: `Votre demande de retour ${request.reference} a bien été reçue. Nous la traitons rapidement.`,
    link: '/returns',
  });

  return created(res, { message: 'Demande de retour enregistrée', data: request });
});

// GET /api/returns  → retours de l'utilisateur connecté
export const myReturns = asyncHandler(async (req, res) => {
  const returns = await ReturnRequest.findAll({
    where: { userId: req.user.id },
    include: [
      { model: ReturnItem, as: 'items' },
      { model: Order, as: 'order', attributes: ['id', 'reference'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: returns });
});

// GET /api/returns/:id
export const getReturn = asyncHandler(async (req, res) => {
  const request = await ReturnRequest.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [
      { model: ReturnItem, as: 'items' },
      { model: Order, as: 'order', attributes: ['id', 'reference'] },
    ],
  });
  if (!request) return fail(res, { status: 404, message: 'Demande de retour introuvable' });
  return success(res, { data: request });
});

/* =========================================================================
 *  ADMINISTRATION
 * ========================================================================= */

// GET /api/admin/returns  → toutes les demandes de retour
export const allReturns = asyncHandler(async (req, res) => {
  const returns = await ReturnRequest.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: Order, as: 'order', attributes: ['id', 'reference', 'total'] },
      { model: ReturnItem, as: 'items' },
    ],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: returns });
});

// GET /api/admin/returns/:id  → détail d'une demande
export const getReturnAdmin = asyncHandler(async (req, res) => {
  const request = await ReturnRequest.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: Order, as: 'order', attributes: ['id', 'reference', 'total'] },
      { model: ReturnItem, as: 'items' },
    ],
  });
  if (!request) return fail(res, { status: 404, message: 'Demande de retour introuvable' });
  return success(res, { data: request });
});

// PUT /api/admin/returns/:id/status  { status, adminNote? }
export const updateReturnStatus = asyncHandler(async (req, res) => {
  const request = await ReturnRequest.findByPk(req.params.id);
  if (!request) return fail(res, { status: 404, message: 'Demande de retour introuvable' });

  const { status, adminNote } = req.body;
  if (!Object.values(RETURN_STATUS).includes(status)) {
    return fail(res, { status: 400, message: 'Statut de retour invalide' });
  }

  const patch = { status };
  if (adminNote !== undefined) patch.adminNote = adminNote;
  if ([RETURN_STATUS.REJECTED, RETURN_STATUS.REFUNDED].includes(status)) {
    patch.resolvedAt = new Date();
  }
  await request.update(patch);

  // Remboursement effectué → reflète l'état côté commande
  if (status === RETURN_STATUS.REFUNDED) {
    const order = await Order.findByPk(request.orderId);
    if (order) {
      await order.update({
        status: ORDER_STATUS.RETURNED,
        paymentStatus: PAYMENT_STATUS.REFUNDED,
      });
    }
  }

  await createNotification({
    userId: request.userId,
    type: 'return_status',
    title: 'Mise à jour de votre retour',
    message:
      status === RETURN_STATUS.REFUNDED
        ? `Votre retour ${request.reference} a été remboursé (${fcfa(request.refundAmount)}).`
        : `Votre demande de retour ${request.reference} est désormais « ${RETURN_STATUS_LABELS[status] || status} ».`,
    link: '/returns',
  });

  return success(res, { message: 'Demande de retour mise à jour', data: request });
});
