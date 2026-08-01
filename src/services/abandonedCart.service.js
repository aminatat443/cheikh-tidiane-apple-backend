import { Cart, CartItem, Product, Category, User, Setting } from '../models/index.js';
import { sendMail, isMailConfigured } from '../utils/mailer.js';
import { buildAbandonedCartEmail } from './campaign.service.js';

const SHOP_DEFAULTS = { name: 'Cheikh Tidiane Apple', address: 'Dakar, Sénégal', phone: '', email: '' };
const WEEK_MS = 7 * 24 * 3600 * 1000;

async function getShop() {
  const row = await Setting.findByPk('shop');
  return { ...SHOP_DEFAULTS, ...(row?.value || {}) };
}

/**
 * Paniers considérés « abandonnés » : non vides, sans activité depuis `hours`
 * (et depuis moins de 7 jours), pas encore relancés depuis la dernière activité.
 */
export async function getAbandonedCarts(hours = 4) {
  const carts = await Cart.findAll({
    include: [
      { model: User, attributes: ['id', 'name', 'email'] },
      {
        model: CartItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'images', 'model', 'categoryId'],
            include: [{ model: Category, as: 'category', attributes: ['slug'] }],
          },
        ],
      },
    ],
  });

  const now = Date.now();
  return carts.filter((c) => {
    const items = c.items || [];
    if (!items.length || !c.User?.email) return false;
    const last = Math.max(
      new Date(c.updatedAt).getTime(),
      ...items.map((i) => new Date(i.updatedAt).getTime())
    );
    const age = now - last;
    if (age < hours * 3600 * 1000 || age > WEEK_MS) return false;
    if (c.reminderSentAt && new Date(c.reminderSentAt).getTime() >= last) return false;
    return true;
  });
}

/**
 * Envoie les relances de panier abandonné. `dryRun` = simulation sans envoi.
 * @returns {{candidates:number, sent:number, simulated:boolean}}
 */
export async function runAbandonedCartReminders({ hours = 4, dryRun = false } = {}) {
  const carts = await getAbandonedCarts(hours);
  const shop = await getShop();
  let sent = 0;

  for (const c of carts) {
    const html = buildAbandonedCartEmail({
      user: c.User,
      items: c.items,
      shop,
      unsubscribeUrl: '{{unsubscribe_url}}',
      viewUrl: '{{view_in_browser_url}}',
    });
    if (dryRun) continue;
    try {
      await sendMail({
        to: c.User.email,
        subject: `${shop.name} — Vous avez oublié votre panier 🛒`,
        html,
        text: 'Vous avez oublié des articles dans votre panier. Reprenez votre commande quand vous voulez.',
      });
      await c.update({ reminderSentAt: new Date() });
      sent += 1;
    } catch {
      /* on continue même si un envoi échoue */
    }
  }

  return { candidates: carts.length, sent, simulated: !isMailConfigured() };
}
