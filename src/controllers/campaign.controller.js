import { Op } from 'sequelize';
import { Product, User, Category, Setting, Order, OrderItem } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, fail } from '../utils/apiResponse.js';
import { ROLES } from '../utils/constants.js';
import { sendMail, isMailConfigured } from '../utils/mailer.js';
import {
  buildPromoEmail,
  buildNewsletterEmail,
  buildAbandonedCartEmail,
  buildRecommendationsEmail,
} from '../services/campaign.service.js';
import { runAbandonedCartReminders } from '../services/abandonedCart.service.js';

const SHOP_DEFAULTS = { name: 'Cheikh Tidiane Apple', address: 'Dakar, Sénégal', phone: '', email: '' };

const CAMPAIGNS = {
  promo: {
    build: buildPromoEmail,
    subject: (shop) => `${shop.name} — Jusqu'à 30% de réduction sur les iPhone`,
    order: [['isFeatured', 'DESC'], ['isPromo', 'DESC'], ['isNew', 'DESC'], ['createdAt', 'DESC']],
    text: 'Découvrez nos meilleures offres du moment.',
  },
  newsletter: {
    build: buildNewsletterEmail,
    subject: (shop) => `${shop.name} — Nouveaux arrivages`,
    order: [['isNew', 'DESC'], ['createdAt', 'DESC']],
    text: 'Découvrez nos tout derniers arrivages.',
  },
};

async function getShop() {
  const row = await Setting.findByPk('shop');
  return { ...SHOP_DEFAULTS, ...(row?.value || {}) };
}

/** Construit l'email d'une campagne (promo|newsletter) depuis les vrais produits. */
async function buildEmail(type) {
  const cfg = CAMPAIGNS[type];
  const all = await Product.findAll({
    include: [{ model: Category, as: 'category', attributes: ['slug', 'name'] }],
    order: cfg.order,
    limit: 8,
  });
  const list = all.map((p) => p.toJSON());
  const shop = await getShop();
  const html = cfg.build({
    featured: list.slice(0, 4),
    recommended: list.slice(4, 8),
    shop,
    unsubscribeUrl: '{{unsubscribe_url}}',
    viewUrl: '{{view_in_browser_url}}',
  });
  return { html, shop, cfg };
}

// GET /api/admin/campaigns/abandoned-cart/preview  → aperçu (panier de démo)
export const previewAbandonedCart = asyncHandler(async (req, res) => {
  const shop = await getShop();
  const prods = await Product.findAll({
    include: [{ model: Category, as: 'category', attributes: ['slug'] }],
    order: [['createdAt', 'DESC']],
    limit: 2,
  });
  const items = prods.map((p, i) => ({ quantity: i + 1, product: p.toJSON() }));
  const html = buildAbandonedCartEmail({
    user: { name: 'Client' },
    items,
    shop,
    unsubscribeUrl: '{{unsubscribe_url}}',
    viewUrl: '{{view_in_browser_url}}',
  });
  res.set('Content-Type', 'text/html; charset=utf-8').send(html);
});

// POST /api/admin/campaigns/abandoned-cart/run  { hours?, dryRun? }
export const runAbandonedCart = asyncHandler(async (req, res) => {
  const hours = Number.isFinite(Number(req.body.hours)) ? Number(req.body.hours) : 4;
  const dryRun = !!req.body.dryRun;
  const r = await runAbandonedCartReminders({ hours, dryRun });
  const message = dryRun
    ? `${r.candidates} panier(s) abandonné(s) détecté(s).`
    : r.simulated
    ? `Simulation : ${r.sent} relance(s) préparée(s) (${r.candidates} panier(s)).`
    : `${r.sent} relance(s) envoyée(s) sur ${r.candidates} panier(s).`;
  return success(res, { message, data: r });
});

/* ---------------- Recommandations personnalisées ---------------- */

/**
 * Calcule jusqu'à `limit` produits recommandés pour un client, à partir des
 * catégories déjà achetées (produits non encore commandés), avec repli sur les
 * nouveautés/mises en avant si l'historique est insuffisant.
 */
async function recommendFor(userId, limit = 4) {
  const orders = await Order.findAll({
    where: { userId },
    include: [{ model: OrderItem, as: 'items', attributes: ['productId'] }],
  });
  const boughtIds = [
    ...new Set(orders.flatMap((o) => (o.items || []).map((i) => i.productId)).filter(Boolean)),
  ];

  const catInclude = [{ model: Category, as: 'category', attributes: ['slug', 'name'] }];
  let cats = [];
  if (boughtIds.length) {
    const bought = await Product.findAll({ where: { id: boughtIds }, attributes: ['categoryId'] });
    cats = [...new Set(bought.map((p) => p.categoryId).filter(Boolean))];
  }

  let recs = [];
  if (cats.length) {
    recs = await Product.findAll({
      where: { categoryId: cats, ...(boughtIds.length ? { id: { [Op.notIn]: boughtIds } } : {}) },
      include: catInclude,
      order: [['isFeatured', 'DESC'], ['isNew', 'DESC'], ['createdAt', 'DESC']],
      limit,
    });
  }
  if (recs.length < limit) {
    const exclude = [...boughtIds, ...recs.map((r) => r.id)];
    const fill = await Product.findAll({
      where: exclude.length ? { id: { [Op.notIn]: exclude } } : {},
      include: catInclude,
      order: [['isNew', 'DESC'], ['isFeatured', 'DESC'], ['createdAt', 'DESC']],
      limit: limit - recs.length,
    });
    recs = [...recs, ...fill];
  }
  return recs.map((p) => p.toJSON());
}

// GET /api/admin/campaigns/recommendations/preview  → aperçu (basé sur l'admin connecté)
export const previewRecommendations = asyncHandler(async (req, res) => {
  const shop = await getShop();
  const products = await recommendFor(req.user.id, 8);
  const html = buildRecommendationsEmail({
    user: { name: req.user.name },
    products,
    shop,
    unsubscribeUrl: '{{unsubscribe_url}}',
    viewUrl: '{{view_in_browser_url}}',
  });
  res.set('Content-Type', 'text/html; charset=utf-8').send(html);
});

// POST /api/admin/campaigns/recommendations/run  { audience:'test'|'all', email? }
export const runRecommendations = asyncHandler(async (req, res) => {
  const audience = req.body.audience === 'all' ? 'all' : 'test';
  const shop = await getShop();

  let recipients = [];
  if (audience === 'all') {
    recipients = await User.findAll({ where: { role: ROLES.CLIENT }, attributes: ['id', 'name', 'email'] });
  } else {
    const email = req.body.email || req.user.email;
    recipients = [{ id: req.user.id, name: req.user.name, email }];
  }
  recipients = recipients.filter((u) => u.email);
  if (!recipients.length) return fail(res, { status: 400, message: 'Aucun destinataire' });

  let sent = 0;
  for (const u of recipients) {
    try {
      const products = await recommendFor(u.id, 8);
      if (!products.length) continue;
      const html = buildRecommendationsEmail({ user: { name: u.name }, products, shop });
      await sendMail({
        to: u.email,
        subject: `${shop.name} — Notre sélection rien que pour vous`,
        html,
        text: 'Des produits choisis selon vos préférences.',
      });
      sent += 1;
    } catch {
      /* on continue même si un envoi échoue */
    }
  }

  const simulated = !isMailConfigured();
  return success(res, {
    message: simulated
      ? `Simulation : ${sent} e-mail(s) personnalisé(s) préparé(s) (SMTP non configuré).`
      : `Recommandations envoyées à ${sent} client(s).`,
    data: { sent, audience, simulated },
  });
});

// GET /api/admin/campaigns/:type/preview  → HTML brut
export const preview = asyncHandler(async (req, res) => {
  const type = CAMPAIGNS[req.params.type] ? req.params.type : null;
  if (!type) return fail(res, { status: 404, message: 'Campagne inconnue' });
  const { html } = await buildEmail(type);
  res.set('Content-Type', 'text/html; charset=utf-8').send(html);
});

// POST /api/admin/campaigns/:type/send  { audience:'test'|'all', email? }
export const send = asyncHandler(async (req, res) => {
  const type = CAMPAIGNS[req.params.type] ? req.params.type : null;
  if (!type) return fail(res, { status: 404, message: 'Campagne inconnue' });

  const audience = req.body.audience === 'all' ? 'all' : 'test';
  const { html, shop, cfg } = await buildEmail(type);
  const subject = cfg.subject(shop);

  let recipients = [];
  if (audience === 'all') {
    const clients = await User.findAll({ where: { role: ROLES.CLIENT }, attributes: ['email'] });
    recipients = clients.map((c) => c.email).filter(Boolean);
  } else {
    recipients = [req.body.email || req.user.email].filter(Boolean);
  }
  if (!recipients.length) return fail(res, { status: 400, message: 'Aucun destinataire' });

  let sent = 0;
  for (const to of recipients) {
    try {
      await sendMail({ to, subject, html, text: cfg.text });
      sent += 1;
    } catch {
      /* on continue même si un envoi échoue */
    }
  }

  const simulated = !isMailConfigured();
  return success(res, {
    message: simulated
      ? `Simulation : ${sent} e-mail(s) préparé(s) (SMTP non configuré).`
      : `Campagne envoyée à ${sent} destinataire(s).`,
    data: { sent, audience, simulated },
  });
});
