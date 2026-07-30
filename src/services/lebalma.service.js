import { LEBALMA_FREQUENCY } from '../utils/constants.js';

/**
 * Calcule le plan de financement Lebalma d'un produit selon son barème propre.
 *
 * Barème (défini par le métier, cf. affiches) :
 *   - Acompte = downPercent % du prix cash, à payer à la souscription.
 *   - Reste   = prix − acompte.
 *   - Montant financé = reste × multiplier  (ex. ×1,6 sur 3 mois, ×1,7 sur 6 mois).
 *   - Mensualité = montant financé ÷ nombre de mois.
 *   - Coût total = acompte + montant financé.
 *
 * @param {number} price - prix cash en FCFA
 * @param {{downPercent:number, months:number, multiplier:number}} plan
 */
export function computeLebalmaPlan(price, { downPercent, months, multiplier }) {
  const downPaymentAmount = Math.round((price * downPercent) / 100);
  const remaining = price - downPaymentAmount;
  const financedAmount = Math.round(remaining * multiplier);
  const installmentAmount = Math.round(financedAmount / months);
  const totalAmount = downPaymentAmount + financedAmount;

  return {
    frequency: LEBALMA_FREQUENCY.MONTHLY,
    productPrice: price,
    downPaymentPercent: downPercent,
    downPaymentAmount,
    remaining, // « le reste »
    multiplier,
    financedAmount, // montant à répartir sur les mensualités
    months,
    installmentsCount: months,
    installmentAmount, // mensualité
    totalAmount, // coût total (acompte + financé)
  };
}

/** Paramètres Lebalma d'un produit (avec repli). */
export function planFromProduct(product) {
  return {
    downPercent: product.lebalmaDownPercent || 0,
    months: product.lebalmaMonths || 1,
    multiplier: product.lebalmaMultiplier || 1,
  };
}

/**
 * Génère l'échéancier mensuel (dates + montants).
 */
export function generateSchedule(plan, startDate = new Date()) {
  const schedule = [];
  for (let i = 1; i <= plan.installmentsCount; i += 1) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({ sequence: i, dueDate, amount: plan.installmentAmount });
  }
  return schedule;
}
