import { sequelize, Cart, CartItem, Product, Order, OrderItem } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { ORDER_STATUS } from '../utils/constants.js';
import { notifyAdmins } from '../sockets/index.js';

function genReference(prefix = 'CMD') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

// POST /api/orders  { paymentMethod, shipping:{...} }  → crée une commande depuis le panier
export const createOrder = asyncHandler(async (req, res) => {
  const { paymentMethod, shipping = {}, shippingFee = 0 } = req.body;

  const cart = await Cart.findOne({
    where: { userId: req.user.id },
    include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
  });

  if (!cart || !cart.items?.length) {
    return fail(res, { status: 400, message: 'Votre panier est vide' });
  }

  const result = await sequelize.transaction(async (t) => {
    const subtotal = cart.items.reduce((s, it) => s + it.product.price * it.quantity, 0);
    const total = subtotal + Number(shippingFee);

    const order = await Order.create(
      {
        reference: genReference(),
        userId: req.user.id,
        status: ORDER_STATUS.PENDING,
        subtotal,
        shippingFee: Number(shippingFee),
        total,
        paymentMethod,
        shippingName: shipping.name,
        shippingPhone: shipping.phone,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
      },
      { transaction: t }
    );

    for (const it of cart.items) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: it.productId,
          productName: it.product.name,
          unitPrice: it.product.price,
          quantity: it.quantity,
          color: it.color,
          storage: it.storage,
        },
        { transaction: t }
      );
    }

    // Vide le panier
    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
    return order;
  });

  notifyAdmins('order:new', { id: result.id, reference: result.reference, total: result.total });

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
