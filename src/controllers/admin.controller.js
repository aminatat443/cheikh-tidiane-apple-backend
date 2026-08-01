import crypto from 'crypto';
import { Op, fn, col } from 'sequelize';
import {
  User,
  Product,
  Order,
  OrderItem,
  LebalmaContract,
  LebalmaInstallment,
  Setting,
} from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { ORDER_STATUS, ROLES, ADMIN_ROLES, INSTALLMENT_STATUS } from '../utils/constants.js';
import { buildInvoicePdf, fetchImageBuffer } from '../services/invoice.service.js';
import { createNotification } from '../services/notification.service.js';
import { sendOrderEmail } from '../services/orderEmail.service.js';

const SHOP_SETTINGS_KEY = 'shop';

const ORDER_STATUS_LABELS = {
  pending: 'en attente',
  paid: 'payée',
  processing: 'en préparation',
  shipped: 'expédiée',
  delivered: 'livrée',
  cancelled: 'annulée',
  returned: 'retournée',
};

// Coordonnées par défaut de la boutique (surchargées par les réglages admin)
const SHOP_DEFAULTS = {
  name: 'Cheikh Tidiane Apple',
  address: 'Dakar, Sénégal',
  phone: '',
  email: '',
  ninea: '',
  rccm: '',
  stampUrl: '',
};

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

// Clé de jour locale AAAA-MM-JJ (cohérente pour l'agrégation de la tendance).
const dayKey = (v) => {
  if (typeof v === 'string') return v.slice(0, 10);
  const d = new Date(v);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Construit la tendance sur N jours { day, label, revenue, orders } (jours manquants = 0). */
function buildTrend(revRows, ordRows, days = 14) {
  const rev = {};
  for (const r of revRows) rev[dayKey(r.day)] = Number(r.revenue) || 0;
  const ord = {};
  for (const r of ordRows) ord[dayKey(r.day)] = Number(r.orders) || 0;

  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dayKey(d);
    out.push({ day: key, label: `${d.getDate()}/${d.getMonth() + 1}`, revenue: rev[key] || 0, orders: ord[key] || 0 });
  }
  return out;
}

/** Transforme un résultat groupé Sequelize en objet { status: count }. */
function toMap(rows, keyField = 'status') {
  const map = {};
  for (const r of rows) {
    const plain = r.toJSON ? r.toJSON() : r;
    map[plain[keyField]] = Number(plain.count);
  }
  return map;
}

// GET /api/admin/dashboard  → statistiques complètes
export const dashboard = asyncHandler(async (req, res) => {
  const trendSince = new Date();
  trendSince.setDate(trendSince.getDate() - 13);
  trendSince.setHours(0, 0, 0, 0);

  const [
    productsCount,
    clientsCount,
    ordersCount,
    contractsCount,
    revenue,
    revenueMonth,
    ordersMonth,
    ordersByStatusRows,
    contractsByStatusRows,
    outstanding,
    recentOrders,
    lowStock,
    revByDay,
    ordByDay,
  ] = await Promise.all([
    Product.count(),
    User.count({ where: { role: ROLES.CLIENT } }),
    Order.count(),
    LebalmaContract.count(),
    Order.sum('total', { where: { status: ORDER_STATUS.PAID } }),
    Order.sum('total', {
      where: { status: ORDER_STATUS.PAID, createdAt: { [Op.gte]: startOfMonth() } },
    }),
    Order.count({ where: { createdAt: { [Op.gte]: startOfMonth() } } }),
    Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    }),
    LebalmaContract.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
    }),
    LebalmaInstallment.sum('amount', {
      where: { status: { [Op.ne]: INSTALLMENT_STATUS.PAID } },
    }),
    Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items', attributes: ['productName', 'quantity'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: 6,
    }),
    Product.findAll({
      where: { stock: { [Op.lte]: 3 } },
      attributes: ['id', 'name', 'stock', 'price', 'images'],
      order: [['stock', 'ASC']],
      limit: 6,
    }),
    // Tendance CA (14 j) — revenu des commandes payées, par jour
    Order.findAll({
      attributes: [[fn('DATE', col('createdAt')), 'day'], [fn('SUM', col('total')), 'revenue']],
      where: { status: ORDER_STATUS.PAID, createdAt: { [Op.gte]: trendSince } },
      group: [fn('DATE', col('createdAt'))],
      raw: true,
    }),
    // Tendance commandes (14 j) — nombre de commandes par jour
    Order.findAll({
      attributes: [[fn('DATE', col('createdAt')), 'day'], [fn('COUNT', col('id')), 'orders']],
      where: { createdAt: { [Op.gte]: trendSince } },
      group: [fn('DATE', col('createdAt'))],
      raw: true,
    }),
  ]);

  return success(res, {
    data: {
      productsCount,
      clientsCount,
      ordersCount,
      contractsCount,
      revenue: revenue || 0,
      revenueMonth: revenueMonth || 0,
      ordersMonth: ordersMonth || 0,
      ordersByStatus: toMap(ordersByStatusRows),
      contractsByStatus: toMap(contractsByStatusRows),
      lebalmaOutstanding: outstanding || 0,
      recentOrders,
      lowStock,
      salesTrend: buildTrend(revByDay, ordByDay, 14),
    },
  });
});

// GET /api/admin/orders  → toutes les commandes
export const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'items' },
    ],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: orders });
});

// GET /api/admin/orders/:id  → détail d'une commande (facture)
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: OrderItem, as: 'items' },
    ],
  });
  if (!order) return fail(res, { status: 404, message: 'Commande introuvable' });
  return success(res, { data: order });
});

// PUT /api/admin/orders/:id/status  { status?, paymentStatus? }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return fail(res, { status: 404, message: 'Commande introuvable' });
  const patch = {};
  if (req.body.status) patch.status = req.body.status;
  if (req.body.paymentStatus) patch.paymentStatus = req.body.paymentStatus;
  await order.update(patch);

  // Notifie le client du changement de statut
  if (req.body.status) {
    await createNotification({
      userId: order.userId,
      type: 'order_status',
      title: 'Mise à jour de votre commande',
      message: `Votre commande ${order.reference} est désormais « ${ORDER_STATUS_LABELS[order.status] || order.status} ».`,
      link: '/orders',
    });
    // E-mail d'expédition habillé lorsque la commande passe à « expédiée »
    if (order.status === ORDER_STATUS.SHIPPED) sendOrderEmail(order.id, 'shipped');
  } else if (req.body.paymentStatus === 'success') {
    await createNotification({
      userId: order.userId,
      type: 'order_paid',
      title: 'Paiement confirmé',
      message: `Le paiement de votre commande ${order.reference} a été confirmé.`,
      link: '/orders',
    });
  }

  return success(res, { message: 'Commande mise à jour', data: order });
});

// GET /api/admin/orders/:id/invoice.pdf  → facture PDF générée côté serveur
export const invoicePdf = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: OrderItem, as: 'items' },
    ],
  });
  if (!order) return fail(res, { status: 404, message: 'Commande introuvable' });

  const row = await Setting.findByPk(SHOP_SETTINGS_KEY);
  const shop = { ...SHOP_DEFAULTS, ...(row?.value || {}) };
  const stampBuffer = await fetchImageBuffer(shop.stampUrl);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="facture-${order.reference}.pdf"`);
  return buildInvoicePdf({ order: order.toJSON(), shop, stampBuffer }, res);
});

// GET /api/admin/clients
export const allClients = asyncHandler(async (req, res) => {
  const clients = await User.findAll({
    where: { role: ROLES.CLIENT },
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: clients });
});

// POST /api/admin/clients  → l'admin enregistre un client non inscrit (ex. en boutique)
export const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address, city, password } = req.body;
  if (!name || !email) return fail(res, { status: 400, message: 'Nom et email requis' });

  const existing = await User.scope('withPassword').findOne({ where: { email } });
  if (existing) return fail(res, { status: 409, message: 'Cet email est déjà utilisé' });

  const client = await User.create({
    name,
    email,
    phone,
    address,
    city,
    // Mot de passe fourni par l'admin, sinon généré (le client pourra le réinitialiser).
    password: password && password.length >= 6 ? password : crypto.randomBytes(12).toString('hex'),
    role: ROLES.CLIENT,
  });
  const { password: _pw, twoFactorSecret: _s, ...safe } = client.toJSON();
  return created(res, { message: 'Client enregistré', data: safe });
});

/* ---------------- Gestion des administrateurs (super-admin) ---------------- */

// GET /api/admin/admins  → liste des comptes admin / super-admin
export const listAdmins = asyncHandler(async (req, res) => {
  const admins = await User.findAll({
    where: { role: { [Op.in]: ADMIN_ROLES } },
    order: [['createdAt', 'ASC']],
  });
  return success(res, { data: admins });
});

// POST /api/admin/admins  { name, email, password, phone }
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return fail(res, { status: 400, message: 'Nom, email et mot de passe requis' });
  }
  if (String(password).length < 6) {
    return fail(res, { status: 400, message: 'Mot de passe : 6 caractères minimum' });
  }
  const existing = await User.scope('withPassword').findOne({ where: { email } });
  if (existing) return fail(res, { status: 409, message: 'Cet email est déjà utilisé' });

  const admin = await User.create({ name, email, password, phone, role: ROLES.ADMIN });
  const { password: _pw, ...safe } = admin.toJSON();
  return created(res, { message: 'Administrateur créé', data: safe });
});

// DELETE /api/admin/admins/:id
export const deleteAdmin = asyncHandler(async (req, res) => {
  const target = await User.findByPk(req.params.id);
  if (!target || !ADMIN_ROLES.includes(target.role)) {
    return fail(res, { status: 404, message: 'Administrateur introuvable' });
  }
  if (target.role === ROLES.SUPERADMIN) {
    return fail(res, { status: 403, message: 'Le super-admin ne peut pas être supprimé' });
  }
  if (target.id === req.user.id) {
    return fail(res, { status: 400, message: 'Vous ne pouvez pas supprimer votre propre compte' });
  }
  await target.destroy();
  return success(res, { message: 'Administrateur supprimé' });
});

// GET /api/admin/settings  → réglages boutique / facturation
export const getSettings = asyncHandler(async (req, res) => {
  const row = await Setting.findByPk(SHOP_SETTINGS_KEY);
  return success(res, { data: row?.value || {} });
});

// PUT /api/admin/settings  → met à jour les réglages (fusion)
export const updateSettings = asyncHandler(async (req, res) => {
  const row = await Setting.findByPk(SHOP_SETTINGS_KEY);
  const merged = { ...(row?.value || {}), ...(req.body || {}) };
  if (row) {
    await row.update({ value: merged });
  } else {
    await Setting.create({ key: SHOP_SETTINGS_KEY, value: merged });
  }
  return success(res, { message: 'Réglages enregistrés', data: merged });
});
