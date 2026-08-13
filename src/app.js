import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// --- Sécurité & middlewares globaux ---
// crossOriginResourcePolicy 'cross-origin' pour que le frontend puisse charger
// les images servies depuis /uploads (origines différentes en dev).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS : liste blanche via CLIENT_URL (séparée par virgules). Comparaison
// TOLÉRANTE (espaces + slash final ignorés) pour éviter les faux négatifs.
// En développement, on tolère n'importe quel localhost (le port Vite peut varier),
// et en toute circonstance les sous-domaines *.netlify.app (site + deploy previews).
const normalizeOrigin = (o) => (o || '').trim().replace(/\/+$/, '').toLowerCase();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (allowedOrigins.includes(normalizeOrigin(origin))) return true;
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) return true;
  try {
    if (/\.netlify\.app$/i.test(new URL(origin).hostname)) return true;
  } catch { /* origine non-URL : ignorée */ }
  return false;
}

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl, apps mobiles, same-origin
      return cb(null, isAllowedOrigin(origin)); // sinon : pas d'en-tête CORS → le navigateur bloque
    },
    credentials: true,
  })
);
// On conserve le corps brut (req.rawBody) pour vérifier la signature des webhooks.
app.use(express.json({ limit: '5mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
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

// --- Frontend (production) : Express sert le build React → un seul déploiement ---
// Copiez le contenu de `cheikh_tidiane_apple_frontend/dist` dans `backend/public`
// (ou pointez CLIENT_DIST_PATH vers le dossier `dist`).
if (process.env.NODE_ENV === 'production') {
  const clientDist = process.env.CLIENT_DIST_PATH
    ? path.resolve(process.env.CLIENT_DIST_PATH)
    : path.resolve(__dirname, '../public');
  app.use(express.static(clientDist));
  // Fallback SPA : tout ce qui n'est ni /api ni /uploads renvoie index.html.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// --- Gestion des erreurs ---
app.use(notFound);
app.use(errorHandler);

export default app;
