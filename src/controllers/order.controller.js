import { sequelize, Cart, CartItem, Product, Order, OrderItem, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { ORDER_STATUS } from '../utils/constants.js';
import { getZoneFee, getZoneLabel } from '../config/delivery.js';
import { notifyAdmins } from '../sockets/index.js';
import { createNotification, notifyAllAdmins, fcfa } from '../services/notification.service.js';
import { sendOrderEmail } from '../services/orderEmail.service.js';

function genReference(prefix = 'CMD') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

// Prix unitaire fiable, calculé côté serveur (variante selon le stockage, sinon prix de base).
function unitPriceFor(product, storage) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const v = storage ? variants.find((x) => x.storage === storage) : null;
  return Number(v?.price ?? product.price) || 0;
}

/**
 * POST /api/orders
 * body : { items:[{productId,quantity,color,storage}], paymentMethod, deliveryZone, shipping:{phone,address} }
 * Le panier fait foi côté client, mais les montants (prix + livraison) sont
 * TOUJOURS recalculés côté serveur. Repli sur le panier serveur si aucun article fourni.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { paymentMethod, shipping = {}, deliveryZone } = req.body;

  // Frais de livraison recalculés depuis la zone (jamais la valeur du client).
  const shippingFee = getZoneFee(deliveryZone);
  if (shippingFee == null) {
    return fail(res, { status: 400, message: 'Zone de livraison invalide' });
  }
  if (!shipping.address) {
    return fail(res, { status: 400, message: 'Adresse de livraison requise' });
  }

  // Normalise les articles envoyés par le client, sinon retombe sur le panier serveur.
  let lines = Array.isArray(req.body.items)
    ? req.body.items
        .map((it) => ({
          productId: Number(it.productId ?? it.product?.id),
          quantity: Math.max(1, Number(it.quantity) || 1),
          color: it.color || null,
          storage: it.storage || null,
        }))
        .filter((it) => it.productId)
    : [];

  let cart = null;
  if (!lines.length) {
    cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{ model: CartItem, as: 'items' }],
    });
    lines = (cart?.items || []).map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      color: it.color,
      storage: it.storage,
    }));
  }

  if (!lines.length) {
    return fail(res, { status: 400, message: 'Votre panier est vide' });
  }

  // Charge les produits réels pour fiabiliser noms et prix.
  const products = await Product.findAll({ where: { id: [...new Set(lines.map((l) => l.productId))] } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const validLines = lines.filter((l) => byId.has(l.productId));
  if (!validLines.length) {
    return fail(res, { status: 400, message: 'Aucun produit valide dans le panier' });
  }

  const result = await sequelize.transaction(async (t) => {
    const subtotal = validLines.reduce((s, l) => {
      const p = byId.get(l.productId);
      return s + unitPriceFor(p, l.storage) * l.quantity;
    }, 0);
    const total = subtotal + shippingFee;

    const order = await Order.create(
      {
        reference: genReference(),
        userId: req.user.id,
        status: ORDER_STATUS.PENDING,
        subtotal,
        shippingFee,
        total,
        paymentMethod,
        shippingName: shipping.name || req.user.name,
        shippingPhone: shipping.phone || req.user.phone,
        shippingAddress: shipping.address,
        shippingCity: getZoneLabel(deliveryZone),
      },
      { transaction: t }
    );

    for (const l of validLines) {
      const p = byId.get(l.productId);
      await OrderItem.create(
        {
          orderId: order.id,
          productId: p.id,
          productName: p.name,
          unitPrice: unitPriceFor(p, l.storage),
          quantity: l.quantity,
          color: l.color,
          storage: l.storage,
        },
        { transaction: t }
      );
    }

    // Vide le panier serveur s'il a servi de source.
    if (cart) await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    // Mémorise l'adresse de livraison dans le profil (préremplissage des prochaines commandes).
    await User.update(
      { address: shipping.address, deliveryZone, ...(shipping.phone ? { phone: shipping.phone } : {}) },
      { where: { id: req.user.id }, transaction: t }
    );

    return order;
  });

  notifyAdmins('order:new', { id: result.id, reference: result.reference, total: result.total });

  // Notifications persistées : admins + accusé de réception au client
  await notifyAllAdmins({
    type: 'order_new',
    title: 'Nouvelle commande',
    message: `Commande ${result.reference} — ${fcfa(result.total)}`,
    link: '/admin/orders',
  });
  await createNotification({
    userId: req.user.id,
    type: 'order_confirm',
    title: 'Commande enregistrée',
    message: `Votre commande ${result.reference} a bien été reçue. Total : ${fcfa(result.total)}.`,
    link: '/orders',
  });

  // E-mail de confirmation (habillé, best-effort)
  sendOrderEmail(result.id, 'confirmation');

  return created(res, { message: 'Commande créée', data: result });
});

// GET /api/orders  → commandes de l'utilisateur connecté
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: orders });
});

// GET /api/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: OrderItem, as: 'items' }],
  });
  if (!order) return fail(res, { status: 404, message: 'Commande introuvable' });
  return success(res, { data: order });
});
