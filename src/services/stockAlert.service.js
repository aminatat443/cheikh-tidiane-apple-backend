import { StockAlert, User, Setting } from '../models/index.js';
import { sendMail } from '../utils/mailer.js';
import { buildBackInStockEmail } from './campaign.service.js';
import { createNotification } from './notification.service.js';

const SHOP_DEFAULTS = { name: 'Cheikh Tidiane Apple', address: 'Dakar, Sénégal', phone: '', email: '' };

async function getShop() {
  const row = await Setting.findByPk('shop');
  return { ...SHOP_DEFAULTS, ...(row?.value || {}) };
}

/**
 * Inscrit un client à l'alerte « retour en stock » d'un produit.
 * Idempotent : ré-arme l'alerte (notifiedAt = null) si elle existait déjà.
 */
export async function subscribeStockAlert(userId, productId) {
  const [alert, createdRow] = await StockAlert.findOrCreate({
    where: { userId, productId },
    defaults: { userId, productId, notifiedAt: null },
  });
  if (!createdRow && alert.notifiedAt) {
    await alert.update({ notifiedAt: null });
  }
  return alert;
}

/**
 * Prévient tous les clients en attente qu'un produit est de nouveau disponible.
 * Appelé quand le stock passe de 0 à > 0. Best-effort, marque chaque alerte traitée.
 * @returns {Promise<number>} nombre d'alertes notifiées
 */
export async function notifyBackInStock(product) {
  const alerts = await StockAlert.findAll({
    where: { productId: product.id, notifiedAt: null },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });
  if (!alerts.length) return 0;

  const shop = await getShop();
  const plain = typeof product.toJSON === 'function' ? product.toJSON() : product;

  let notified = 0;
  for (const alert of alerts) {
    try {
      await createNotification({
        userId: alert.userId,
        type: 'back_in_stock',
        title: 'De retour en stock',
        message: `${plain.name} est de nouveau disponible. Commandez avant une nouvelle rupture.`,
        link: `/products/${plain.id}`,
      });
      if (alert.user?.email) {
        const html = buildBackInStockEmail({ user: alert.user.toJSON(), product: plain, shop });
        await sendMail({
          to: alert.user.email,
          subject: `${shop.name} — ${plain.name} est de retour en stock`,
          html,
          text: `${plain.name} est de nouveau disponible.`,
        });
      }
      await alert.update({ notifiedAt: new Date() });
      notified += 1;
    } catch {
      /* on continue avec les autres inscrits */
    }
  }
  return notified;
}
