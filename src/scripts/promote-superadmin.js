import 'dotenv/config';
import { sequelize, User } from '../models/index.js';
import { ROLES } from '../utils/constants.js';

/**
 * Promeut le compte de la boutique en SUPER-ADMIN (idempotent, non destructif).
 * Cible : admin@cheikhtidiane.com (surchargeable via SUPERADMIN_EMAIL).
 *   node src/scripts/promote-superadmin.js
 */
const EMAIL = process.env.SUPERADMIN_EMAIL || 'admin@cheikhtidiane.com';

async function run() {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email: EMAIL } });
  if (!user) {
    console.error(`❌ Aucun utilisateur avec l'email ${EMAIL}. Lancez d'abord npm run db:seed.`);
    process.exit(1);
  }
  const patch = {};
  if (user.role !== ROLES.SUPERADMIN) patch.role = ROLES.SUPERADMIN;
  if (!user.name || user.name === 'Admin') patch.name = 'Cheikh Tidiane';
  if (Object.keys(patch).length) {
    await user.update(patch);
    console.log(`✅ ${EMAIL} mis à jour : ${JSON.stringify(patch)}`);
  } else {
    console.log(`✅ ${EMAIL} est déjà super-admin (aucune modification).`);
  }
  await sequelize.close();
}

run().catch(async (err) => {
  console.error('❌ Promotion échouée :', err.message);
  try { await sequelize.close(); } catch { /* noop */ }
  process.exit(1);
});
