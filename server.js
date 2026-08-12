import http from 'http';
import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from './src/models/index.js';
import { initSocket } from './src/sockets/index.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialisation Socket.IO (notifications temps réel)
initSocket(server);

async function start() {
  try {
    // Vérifie la connexion MySQL
    await sequelize.authenticate();
    console.log('✅ Connexion Postgres établie.');

    // Synchronise les modèles en développement (en prod : utiliser des migrations).
    // ⚠️ On n'utilise PLUS `alter: true` au démarrage : à chaque restart il ré-ajoutait
    // des index (email_2, email_3, …) jusqu'à dépasser la limite MySQL de 64 clés/table
    // → crash « Too many keys ». Par défaut : `sync()` simple (crée les tables manquantes,
    // ne modifie pas les tables existantes). Pour appliquer un CHANGEMENT de modèle,
    // lancer explicitement une fois : `npm run db:sync` (ou démarrer avec DB_SYNC=alter).
    if (process.env.NODE_ENV !== 'production') {
      const alter = process.env.DB_SYNC === 'alter';
      await sequelize.sync(alter ? { alter: true } : undefined);
      console.log(`✅ Modèles Sequelize synchronisés${alter ? ' (alter)' : ''}.`);
    }

    server.listen(PORT, () => {
      console.log(`🚀 API en écoute sur http://https://cheikh-tidiane-apple-backend.onrender.com/:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur :', error.message);
    process.exit(1);
  }
}

start();
