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
    console.log('✅ Connexion MySQL établie.');

    // Synchronise les modèles en développement (en prod : utiliser des migrations)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modèles Sequelize synchronisés.');
    }

    server.listen(PORT, () => {
      console.log(`🚀 API en écoute sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur :', error.message);
    process.exit(1);
  }
}

start();
