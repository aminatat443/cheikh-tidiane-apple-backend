import { sequelize, User, Product, Order, LebalmaContract } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { ORDER_STATUS, ROLES } from '../utils/constants.js';

// GET /api/admin/dashboard  → statistiques
export const dashboard = asyncHandler(async (req, res) => {
  const [productsCount, clientsCount, ordersCount, contractsCount, revenue] = await Promise.all([
    Product.count(),
    User.count({ where: { role: ROLES.CLIENT } }),
    Order.count(),
    LebalmaContract.count(),
    Order.sum('total', { where: { status: ORDER_STATUS.PAID } }),
  ]);

  return success(res, {
    data: {
      productsCount,
      clientsCount,
      ordersCount,
      contractsCount,
      revenue: revenue || 0, // FCFA
    },
  });
});

// GET /api/admin/orders  → toutes les commandes
export const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: orders });
});

// PUT /api/admin/orders/:id/status  { status }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return success(res, { status: 404, message: 'Commande introuvable' });
  await order.update({ status: req.body.status });
  return success(res, { message: 'Statut mis à jour', data: order });
});

// GET /api/admin/clients
export const allClients = asyncHandler(async (req, res) => {
  const clients = await User.findAll({ where: { role: ROLES.CLIENT } });
  return success(res, { data: clients });
});
