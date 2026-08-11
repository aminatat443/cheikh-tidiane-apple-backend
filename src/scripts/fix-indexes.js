import 'dotenv/config';
import { sequelize } from '../models/index.js';

/**
 * Supprime les index dupliqués accumulés par `sequelize.sync({ alter: true })`
 * (ex. email, email_2, email_3 … sur `users`) qui finissent par dépasser la
 * limite MySQL de 64 clés par table. Non destructif pour les données.
 *   npm run db:fix-indexes
 */
async function run() {
  await sequelize.authenticate();

  // Spécifique MySQL/MariaDB (limite de 64 clés + `SHOW INDEX`). Sur PostgreSQL,
  // ce problème n'existe pas : on ne fait rien.
  if (sequelize.getDialect() !== 'mysql' && sequelize.getDialect() !== 'mariadb') {
    console.log(`ℹ️  Dialecte « ${sequelize.getDialect()} » : nettoyage d'index inutile (aucune limite de clés). Rien à faire.`);
    process.exit(0);
  }

  const [tables] = await sequelize.query('SHOW TABLES');
  let dropped = 0;

  for (const row of tables) {
    const table = Object.values(row)[0];
    const [idx] = await sequelize.query(`SHOW INDEX FROM \`${table}\``);

    // Regroupe les colonnes par nom d'index (respecte l'ordre Seq_in_index).
    const byName = {};
    for (const i of idx) {
      (byName[i.Key_name] ||= []).push([i.Seq_in_index, i.Column_name]);
    }

    const seen = new Set();
    for (const [name, parts] of Object.entries(byName)) {
      const sig = parts.sort((a, b) => a[0] - b[0]).map((p) => p[1]).join(',');
      if (name === 'PRIMARY') { seen.add(sig); continue; }
      if (seen.has(sig)) {
        try {
          await sequelize.query(`ALTER TABLE \`${table}\` DROP INDEX \`${name}\``);
          console.log(`🧹 Index dupliqué supprimé : ${table}.${name} (${sig})`);
          dropped += 1;
        } catch (e) {
          console.warn(`⚠️  ${table}.${name} : ${e.message}`);
        }
      } else {
        seen.add(sig);
      }
    }
  }

  console.log(`✅ Terminé. ${dropped} index dupliqué(s) supprimé(s).`);
  await sequelize.close();
}

run().catch(async (err) => {
  console.error('❌ Échec :', err.message);
  try { await sequelize.close(); } catch { /* noop */ }
  process.exit(1);
});
