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
import { ORDER_STATUS, PAYMENT_STATUS, ROLES, ADMIN_ROLES, INSTALLMENT_STATUS } from '../utils/constants.js';
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

const MONTH_LABELS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Construit la série des N derniers mois { month:'AAAA-MM', label, revenue } (mois vides = 0). */
function buildMonths(rows, n = 12) {
  const map = {};
  for (const r of rows) map[r.month] = Number(r.revenue) || 0;
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    out.push({ month: key, label: MONTH_LABELS[d.getMonth()], revenue: map[key] || 0 });
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

// GET /api/admin/finance  → indicateurs financiers
export const financeStats = asyncHandler(async (req, res) => {
  const monthStart = startOfMonth();
  const prevMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1);
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const since12 = new Date();
  since12.setMonth(since12.getMonth() - 11);
  since12.setDate(1);
  since12.setHours(0, 0, 0, 0);

  const paid = { status: ORDER_STATUS.PAID };

  const [
    revenueTotal,
    revenueMonth,
    revenuePrevMonth,
    revenueToday,
    paidOrdersCount,
    lebalmaOutstanding,
    lebalmaCollected,
    revByMonthRows,
    byMethodRows,
  ] = await Promise.all([
    Order.sum('total', { where: paid }),
    Order.sum('total', { where: { ...paid, createdAt: { [Op.gte]: monthStart } } }),
    Order.sum('total', { where: { ...paid, createdAt: { [Op.gte]: prevMonthStart, [Op.lt]: monthStart } } }),
    Order.sum('total', { where: { ...paid, createdAt: { [Op.gte]: dayStart } } }),
    Order.count({ where: paid }),
    LebalmaInstallment.sum('amount', { where: { status: { [Op.ne]: INSTALLMENT_STATUS.PAID } } }),
    LebalmaInstallment.sum('amount', { where: { status: INSTALLMENT_STATUS.PAID } }),
    Order.findAll({
      attributes: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m'), 'month'], [fn('SUM', col('total')), 'revenue']],
      where: { ...paid, createdAt: { [Op.gte]: since12 } },
      group: [fn('DATE_FORMAT', col('createdAt'), '%Y-%m')],
      raw: true,
    }),
    Order.findAll({
      attributes: ['paymentMethod', [fn('SUM', col('total')), 'revenue'], [fn('COUNT', col('id')), 'count']],
      where: paid,
      group: ['paymentMethod'],
      raw: true,
    }),
  ]);

  const total = revenueTotal || 0;
  const month = revenueMonth || 0;
  const prev = revenuePrevMonth || 0;
  const growthPercent = prev > 0 ? Math.round(((month - prev) / prev) * 100) : month > 0 ? 100 : 0;

  return success(res, {
    data: {
      revenueTotal: total,
      revenueMonth: month,
      revenuePrevMonth: prev,
      revenueToday: revenueToday || 0,
      growthPercent,
      paidOrdersCount: paidOrdersCount || 0,
      avgOrderValue: paidOrdersCount ? Math.round(total / paidOrdersCount) : 0,
      lebalmaOutstanding: lebalmaOutstanding || 0,
      lebalmaCollected: lebalmaCollected || 0,
      revenueByMonth: buildMonths(revByMonthRows, 12),
      revenueByMethod: byMethodRows.map((r) => ({
        method: r.paymentMethod || 'autre',
        revenue: Number(r.revenue) || 0,
        count: Number(r.count) || 0,
      })),
    },
  });
});

const genRef = (prefix = 'CMD') => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

const WALKIN_EMAIL = 'comptoir@cheikhtidiane.local';
const onlyDigits = (s) => (s || '').replace(/\D/g, '');

/**
 * Rattache automatiquement une vente au comptoir à un client déjà inscrit :
 * on compare le téléphone (9 derniers chiffres, robuste au préfixe +221)
 * puis, à défaut, l'adresse exacte. Renvoie l'utilisateur trouvé ou null.
 */
async function findClientByContact({ phone, address } = {}) {
  const phoneTail = onlyDigits(phone).slice(-9);
  const addr = (address || '').trim().toLowerCase();
  if (phoneTail.length < 8 && addr.length < 5) return null;

  const clients = await User.findAll({ where: { role: ROLES.CLIENT } });
  return (
    clients.find((c) => {
      if (c.email === WALKIN_EMAIL) return false;
      if (phoneTail.length >= 8 && onlyDigits(c.phone).slice(-9) === phoneTail) return true;
      if (addr.length >= 5 && (c.address || '').trim().toLowerCase() === addr) return true;
      return false;
    }) || null
  );
}

// POST /api/admin/orders  → commande créée par l'admin (vente sur place / au comptoir)
// body: { userId?, customer:{name,phone,address,city}, items:[{productId,quantity}], paymentMethod, status, shippingFee }
export const createManualOrder = asyncHandler(async (req, res) => {
  const { userId, customer = {}, items = [], paymentMethod = 'cash', status = ORDER_STATUS.PAID, shippingFee = 0 } = req.body;

  const name = (customer.name || '').trim();
  if (!name) return fail(res, { status: 400, message: 'Le nom du client est obligatoire' });

  const lines = (Array.isArray(items) ? items : [])
    .map((it) => ({ productId: Number(it.productId), quantity: Math.max(1, Number(it.quantity) || 1) }))
    .filter((it) => it.productId);
  if (!lines.length) return fail(res, { status: 400, message: 'Ajoutez au moins un article' });

  // Résolution du client :
  //  1) client explicitement choisi (userId) ;
  //  2) sinon rattachement AUTOMATIQUE si le téléphone/adresse correspond à un client existant ;
  //  3) sinon compte partagé « Vente au comptoir ».
  let clientUser = userId ? await User.findByPk(Number(userId)) : null;
  if (!clientUser) clientUser = await findClientByContact(customer);
  const linkedToClient = !!clientUser && clientUser.email !== WALKIN_EMAIL;
  if (!clientUser) {
    const [walkin] = await User.findOrCreate({
      where: { email: WALKIN_EMAIL },
      defaults: {
        name: 'Vente au comptoir',
        email: WALKIN_EMAIL,
        password: crypto.randomBytes(24).toString('hex'),
        role: ROLES.CLIENT,
      },
    });
    clientUser = walkin;
  }

  const products = await Product.findAll({ where: { id: [...new Set(lines.map((l) => l.productId))] } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const valid = lines.filter((l) => byId.has(l.productId));
  if (!valid.length) return fail(res, { status: 400, message: 'Aucun produit valide' });

  const subtotal = valid.reduce((s, l) => s + byId.get(l.productId).price * l.quantity, 0);
  const fee = Number(shippingFee) || 0;
  const paid = status === ORDER_STATUS.PAID;

  const order = await Order.create({
    reference: genRef(),
    userId: clientUser.id,
    status,
    paymentStatus: paid ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.PENDING,
    subtotal,
    shippingFee: fee,
    total: subtotal + fee,
    paymentMethod,
    shippingName: name,
    shippingPhone: (customer.phone || '').trim() || clientUser.phone,
    shippingAddress: (customer.address || '').trim() || clientUser.address || null,
    shippingCity: (customer.city || '').trim() || clientUser.city || null,
  });

  for (const l of valid) {
    const p = byId.get(l.productId);
    await OrderItem.create({
      orderId: order.id,
      productId: p.id,
      productName: p.name,
      unitPrice: p.price,
      quantity: l.quantity,
    });
  }

  return created(res, {
    message: linkedToClient ? 'Commande créée et rattachée au client existant' : 'Commande créée',
    data: order,
    linkedClient: linkedToClient ? { id: clientUser.id, name: clientUser.name } : null,
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
