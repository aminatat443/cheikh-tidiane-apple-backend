import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

// --- Sécurité & middlewares globaux ---
// crossOriginResourcePolicy 'cross-origin' pour que le frontend puisse charger
// les images servies depuis /uploads (origines différentes en dev).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS : liste blanche via CLIENT_URL (séparée par virgules).
// En développement, on tolère n'importe quel localhost (le port Vite peut varier).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl, apps mobiles, same-origin
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return cb(null, true);
      }
      return cb(null, false); // non autorisé : pas d'en-tête CORS (le navigateur bloque)
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Fichiers téléversés (stockage local, servis statiquement) ---
app.use('/uploads', express.static(path.resolve('src/uploads')));

// --- Healthcheck ---
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'API opérationnelle', timestamp: Date.now() });
});

// --- Routes API ---
app.use('/api', routes);

// --- Gestion des erreurs ---
app.use(notFound);
app.use(errorHandler);

export default app;
