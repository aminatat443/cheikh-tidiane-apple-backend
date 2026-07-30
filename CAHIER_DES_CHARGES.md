# Cahier des Charges — Backend (API REST)

**Dépôt :** `cheikh-tidiane-apple-backend`
**Rôle :** API REST de la boutique Apple (iPhone, iPad, MacBook) + financement Lebalma.
**Version :** 1.0 — 24/07/2026

> 📄 Vue d'ensemble du produit : voir le cahier des charges à la racine du projet. Ce document couvre **uniquement le périmètre backend**.

---

## 1. Rôle du backend
Exposer une **API REST JSON** consommée par le frontend React, gérer :
- l'authentification (JWT) et les comptes,
- le catalogue (produits, catégories, recherche/filtres),
- le panier, les favoris, les commandes,
- les paiements (Wave / Orange Money / carte) et les webhooks,
- le financement **Lebalma** (contrats, échéanciers),
- les avis, la newsletter, l'administration,
- les **notifications temps réel** (Socket.IO).

---

## 2. Stack technique
| Rôle | Techno |
|------|--------|
| Runtime / framework | Node.js + Express.js |
| ORM / BDD | Sequelize + MySQL |
| Auth | JWT + Bcrypt |
| Upload / médias | Multer + Cloudinary |
| Email | Nodemailer |
| Temps réel | Socket.IO |
| Sécurité | Helmet, CORS, Express Validator |

Modules ES (`"type": "module"`). Point d'entrée : `server.js` → `src/app.js`.

---

## 3. Architecture en couches
```
routes → validators → controllers → services → repositories → models (Sequelize)
                         middleware (auth, rôle, upload, erreurs)
                         sockets (notifications temps réel)
```
- **routes** : déclaration des endpoints.
- **validators** : règles Express Validator + middleware `validate`.
- **controllers** : orchestration requête/réponse (pas de SQL).
- **services** : logique métier (ex. calcul Lebalma).
- **repositories** : accès données (requêtes Sequelize complexes).
- **models** : schéma + associations.

---

## 4. Modèle de données (Sequelize)
| Modèle | Rôle |
|--------|------|
| `User` | comptes client/admin, KYC Lebalma |
| `Category` | iPhone / iPad / MacBook |
| `Product` | produits + variantes (JSON colors/storages/images), flags marketing, éligibilité Lebalma |
| `Favorite` | liste de souhaits |
| `Cart` / `CartItem` | panier |
| `Order` / `OrderItem` | commandes |
| `Payment` | transactions (Wave/OM/carte/Lebalma) |
| `Review` | avis produits |
| `LebalmaContract` / `LebalmaInstallment` | contrats & échéanciers |

Montants stockés en **entiers FCFA (XOF)**.

---

## 5. Endpoints API (base `/api`)

### Auth
- `POST /auth/register` — inscription
- `POST /auth/login` — connexion
- `GET  /auth/me` — profil courant (protégé)

### Produits & catégories
- `GET  /products` — liste + **recherche/filtres/tri/pagination** (query params : `q, category, model, minPrice, maxPrice, color, storage, isPromo, isTopSale, lebalma, inStock, sort, page, limit`)
- `GET  /products/:id` — détail (+ aperçu plan Lebalma)
- `GET  /products/:productId/reviews` — avis
- `POST /products/:productId/reviews` — publier un avis (protégé)
- `GET  /categories` — liste des catégories

### Panier / favoris (protégés)
- `GET/POST /cart`, `PUT/DELETE /cart/:itemId`
- `GET/POST /favorites`, `DELETE /favorites/:productId`

### Commandes & paiements (protégés)
- `POST /orders` — créer depuis le panier
- `GET  /orders`, `GET /orders/:id`
- `POST /payments` — initier un paiement
- `GET  /payments` — historique
- `POST /payments/webhook` — **webhook passerelle (signature à vérifier)**

### Lebalma
- `GET  /lebalma/simulate?productId=` — simulateur (public)
- `POST /lebalma/subscribe` — souscrire (protégé, KYC requis)
- `GET  /lebalma/contracts` — mes contrats (protégé)

### Utilisateur (protégé)
- `GET/PUT /users/profile`, `GET /users/favorites`

### Admin (protégé + rôle admin)
- `GET  /admin/dashboard` — statistiques
- `POST/PUT/DELETE /admin/products`, `POST /admin/products/upload`
- `POST/PUT/DELETE /admin/categories`
- `GET  /admin/orders`, `PUT /admin/orders/:id/status`
- `GET  /admin/clients`

**Format de réponse :** `{ success, message, data, meta? }` / erreurs `{ success:false, message, errors? }`.

---

## 6. Règles métier LEBALMA (critiques)
- Fréquence **hebdomadaire** : produits **≥ iPhone 11 Pro** (`lebalmaFrequency = weekly`).
- Fréquence **mensuelle** : produits **≥ iPhone 12 Pro** (`lebalmaFrequency = monthly`).
- **Acompte = pourcentage** du prix (décision actée), configurable dans `LEBALMA_CONFIG`.
- **Appareil remis dès l'acompte payé** → **KYC obligatoire** avant souscription.
- Calcul de l'échéancier : `services/lebalma.service.js` (`computeLebalmaPlan`, `generateSchedule`), **déterministe**, tout montant calculé **côté serveur**.

> ⚠️ Paramètres encore à confirmer (dans `LEBALMA_CONFIG`) : % exact d'acompte, nombre d'échéances hebdo/mensuel, frais de service, politique d'impayé.

---

## 7. Sécurité
- JWT (`Authorization: Bearer`), mots de passe hachés (Bcrypt).
- Helmet, CORS restreint à `CLIENT_URL`.
- Validation systématique des entrées (Express Validator).
- Requêtes Sequelize paramétrées (pas de SQL concaténé).
- **Webhooks paiement** : vérifier la signature avant de valider une transaction.
- Aucune donnée de carte stockée ; données KYC à accès restreint.

---

## 8. Configuration & exécution
Variables d'environnement : voir `.env.example`.
```bash
npm install
cp .env.example .env   # renseigner MySQL, JWT, Cloudinary…
npm run db:seed        # données de démo (admin + produits)
npm run dev            # http://localhost:5000
```

---

## 9. Reste à faire (voir STATUT.md)
Intégration réelle des passerelles de paiement, rappels d'échéances automatisés (cron), newsletter, gestion des retours, tests, migrations de production.
