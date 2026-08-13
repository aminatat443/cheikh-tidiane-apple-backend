import 'dotenv/config';
import { sequelize } from '../config/database.js';

/**
 * Ajoute (sans risque, non destructif) les colonnes d'auth manquantes sur `users` :
 * vérification d'e-mail + réinitialisation de mot de passe. Idempotent.
 *   node src/scripts/add-auth-columns.js
 */
const STATEMENTS = [
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerifyToken" VARCHAR(255)`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerifyExpires" TIMESTAMPTZ`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetToken" VARCHAR(255)`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMPTZ`,
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion Postgres établie.');
    for (const sql of STATEMENTS) {
      await sequelize.query(sql);
      console.log('✔︎', sql);
    }
    console.log('✅ Colonnes d\'auth ajoutées (ou déjà présentes).');
    process.exit(0);
  } catch (e) {
    console.error('❌ Échec :', e.message);
    process.exit(1);
  }
}

run();
