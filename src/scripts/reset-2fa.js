import 'dotenv/config';
import { sequelize, User } from '../models/index.js';

/**
 * Réinitialise la double authentification d'un ou plusieurs comptes
 * (utile si un admin perd son téléphone). Au prochain login, l'admin devra
 * refaire l'enrôlement (scan du QR).
 *   node src/scripts/reset-2fa.js [email1] [email2] ...
 * Sans argument : réinitialise les comptes admin de démonstration.
 */
const args = process.argv.slice(2);
const targets = args.length ? args : ['admin@cheikhtidiane.com', 'manager@cheikhtidiane.com'];

async function run() {
  await sequelize.authenticate();
  for (const email of targets) {
    const u = await User.findOne({ where: { email } });
    if (!u) {
      console.log(`⚠️  Introuvable : ${email}`);
      continue;
    }
    await u.update({ twoFactorEnabled: false, twoFactorSecret: null });
    console.log(`🔓 2FA réinitialisée : ${email} (réenrôlement requis à la prochaine connexion)`);
  }
  await sequelize.close();
}

run().catch(async (err) => {
  console.error('❌ Échec :', err.message);
  try { await sequelize.close(); } catch { /* noop */ }
  process.exit(1);
});
