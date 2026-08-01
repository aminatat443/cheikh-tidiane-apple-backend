import { Order, OrderItem, User, Setting } from '../models/index.js';
import { sendMail } from '../utils/mailer.js';
import { buildOrderEmail } from './campaign.service.js';

const SHOP_DEFAULTS = { name: 'Cheikh Tidiane Apple', address: 'Dakar, Sénégal', phone: '', email: '' };

async function getShop() {
  const row = await Setting.findByPk('shop');
  return { ...SHOP_DEFAULTS, ...(row?.value || {}) };
}

/**
 * Envoie l'e-mail transactionnel d'une commande (best-effort, ne bloque jamais).
 * @param {number} orderId
 * @param {'confirmation'|'shipped'} kind
 */
export async function sendOrderEmail(orderId, kind = 'confirmation') {
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items' },
      ],
    });
    if (!order?.user?.email) return;

    const shop = await getShop();
    const html = buildOrderEmail({
      user: order.user.toJSON(),
      order: order.toJSON(),
      items: (order.items || []).map((i) => i.toJSON()),
      shop,
      kind,
    });
    const subject =
      kind === 'shipped'
        ? `${shop.name} — Votre commande ${order.reference} est en route`
        : `${shop.name} — Confirmation de votre commande ${order.reference}`;

    await sendMail({ to: order.user.email, subject, html, text: 'Détails de votre commande.' });
  } catch {
    /* envoi best-effort : on n'interrompt jamais le flux principal */
  }
}
