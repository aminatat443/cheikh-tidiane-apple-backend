# Cheikh Tidiane Apple — Backend (API REST)

API REST de la boutique Apple (iPhone, iPad, MacBook) avec système de financement **Lebalma**.

## Stack
Node.js · Express · Sequelize · MySQL · JWT · Bcrypt · Multer · Cloudinary · Nodemailer · Socket.IO · Helmet · Express Validator.

## Prérequis
- Node.js ≥ 18
- MySQL ≥ 8

## Installation
```bash
npm install
cp .env.example .env      # renseigner les variables (MySQL, JWT, Cloudinary…)
```
Créer la base MySQL indiquée dans `DB_NAME` (ex. `cheikh_tidiane_apple`).

## Démarrage
```bash
npm run db:seed   # (optionnel) données de démo : admin + produits
npm run dev       # mode développement (nodemon) → http://localhost:5000
npm start         # mode production
```
Healthcheck : `GET /health`. Base API : `/api`.

Compte admin de démo (après seed) : `admin@cheikhtidiane.com` / `admin123` (**à changer**).

## Structure
```
src/
  config/        Sequelize (MySQL), Cloudinary
  models/        modèles + associations (index.js)
  repositories/  accès données (requêtes Sequelize)
  services/      logique métier (Lebalma…)
  controllers/   handlers de requêtes
  routes/        endpoints Express
  validators/    règles Express Validator
  middleware/    auth, rôles, upload, erreurs
  sockets/       notifications temps réel (Socket.IO)
  utils/         apiResponse, jwt, mailer, constants
  scripts/       seed
server.js        démarrage HTTP + Socket.IO
```

## Documentation
- [`CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md) — spécifications backend & endpoints
- [`CLAUDE.md`](./CLAUDE.md) — règles de développement
- [`STATUT.md`](./STATUT.md) — avancement

## Endpoints principaux
`/api/auth` · `/api/products` · `/api/categories` · `/api/cart` · `/api/orders` · `/api/payments` · `/api/favorites` · `/api/lebalma` · `/api/users` · `/api/admin`
