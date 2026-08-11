import 'dotenv/config';
import { sequelize } from '../models/index.js';

/**
 * Applique au schéma MySQL les changements faits dans les modèles Sequelize.
 * À lancer VOLONTAIREMENT après avoir modifié/ajouté un modèle :
 *   npm run db:sync
 *
 * Séparé du démarrage du serveur (server.js n'altère plus le schéma à chaque
 * restart) pour éviter l'accumulation d'index dupliqués → erreur MySQL
 * « Too many keys specified; max 64 keys allowed ».
 *
 * Par sécurité, on nettoie d'abord les index dupliqués éventuels, puis on
 * synchronise avec { alter: true }. Non destructif pour les données.
 */
async function dropDuplicateIndexes() {
  const [tables] = await sequelize.query('SHOW TABLES');
  let dropped = 0;
  for (const row of tables) {
    const table = Object.values(row)[0];
    const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${table}\``);
    // Regroupe les index par colonne (hors PRIMARY) : on garde le 1er, on jette les doublons.
    const seenByColumn = new Map();
    const toDrop = new Set();
    for (const idx of indexes) {
      if (idx.Key_name === 'PRIMARY' || idx.Seq_in_index !== 1) continue;
      const col = idx.Column_name;
      if (seenByColumn.has(col)) toDrop.add(idx.Key_name);
      else seenByColumn.set(col, idx.Key_name);
    }
    for (const name of toDrop) {
      try {
        await sequelize.query(`ALTER TABLE \`${table}\` DROP INDEX \`${name}\``);
        dropped += 1;
      } catch {
        /* index déjà supprimé ou utilisé par une contrainte : on ignore */
      }
    }
  }
  return dropped;
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL établie.');

    // Nettoyage d'index dupliqués : uniquement MySQL/MariaDB (limite 64 clés).
    // Sur PostgreSQL, cette limite n'existe pas et `SHOW INDEX` n'existe pas.
    if (sequelize.getDialect() === 'mysql' || sequelize.getDialect() === 'mariadb') {
      const dropped = await dropDuplicateIndexes();
      if (dropped) console.log(`🧹 ${dropped} index dupliqué(s) supprimé(s).`);
    }

    await sequelize.sync({ alter: true });
    console.log('✅ Schéma synchronisé (alter). Tu peux redémarrer le serveur.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Échec de la synchronisation du schéma :', error.message);
    process.exit(1);
  }
}

run();
