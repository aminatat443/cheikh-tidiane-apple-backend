import 'dotenv/config';
import { sequelize } from '../models/index.js';
import { runAbandonedCartReminders } from '../services/abandonedCart.service.js';

/**
 * Relance des paniers abandonnés — à planifier via cron (ex. toutes les heures).
 *   node src/scripts/abandoned-cart.js [heures] [--dry]
 * Défaut : paniers inactifs depuis 4 h.
 */
const hours = Number(process.argv.find((a) => /^\d+$/.test(a))) || 4;
const dryRun = process.argv.includes('--dry');

async function run() {
  await sequelize.authenticate();
  const r = await runAbandonedCartReminders({ hours, dryRun });
  console.log(`🛒 Paniers abandonnés (${hours}h) : ${r.candidates} détecté(s), ${r.sent} relancé(s)${r.simulated ? ' [simulé]' : ''}.`);
  await sequelize.close();
}

run().catch(async (err) => {
  console.error('❌ Relance échouée :', err.message);
  try { await sequelize.close(); } catch { /* noop */ }
  process.exit(1);
});
