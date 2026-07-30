# CLAUDE.md — Backend

Règles de développement pour le dépôt **`cheikh-tidiane-apple-backend`** (API REST).
Voir aussi : `CAHIER_DES_CHARGES.md` (périmètre backend), `STATUT.md` (avancement), et la doc racine du projet.

---

## 1. Stack
Node.js + Express · Sequelize + MySQL · JWT + Bcrypt · Multer + Cloudinary · Nodemailer · Socket.IO · Helmet · CORS · Express Validator.
Modules ES (`"type": "module"`), Node ≥ 18.

## 2. Architecture (à respecter)
```
route → validator → controller → service → repository → model
```
- **Controllers sans SQL** : la logique métier va dans `services/`, l'accès données complexe dans `repositories/`.
- Réponses via les helpers `utils/apiResponse.js` (`success`, `created`, `fail`) — format `{ success, message, data }`.
- Handlers async enveloppés avec `asyncHandler` (pas de try/catch répétitif).
- Erreurs centralisées dans `middleware/error.middleware.js`.

## 3. Conventions
- Fichiers : `*.model.js`, `*.controller.js`, `*.routes.js`, `*.validator.js`, `*.service.js`, `*.repository.js`.
- Modèles Sequelize en `PascalCase`, tables en `snake_case` pluriel (`tableName`).
- Imports ES avec extension `.js` explicite.
- Montants : **entiers en FCFA (XOF)**, jamais de flottant pour l'argent.
- Constantes/enums centralisés dans `utils/constants.js`.

## 4. Sécurité (non négociable)
- Jamais de secret dans le code → `.env` (voir `.env.example`).
- Valider **toutes** les entrées (Express Validator + `validate`).
- Mots de passe hachés (Bcrypt, hook `beforeSave`). Ne jamais renvoyer `password` (scope par défaut l'exclut).
- Auth JWT via middleware `protect` ; rôles via `restrictTo` / `adminOnly`.
- **Webhook paiement** : vérifier la signature avant toute mise à jour de commande.
- Requêtes Sequelize paramétrées, CORS limité à `CLIENT_URL`, Helmet actif.

## 5. Règles métier Lebalma
- Fréquence : `weekly` (≥ iPhone 11 Pro), `monthly` (≥ iPhone 12 Pro).
- Acompte = **pourcentage** ; appareil remis **dès l'acompte** → **KYC requis** (`user.isKycVerified`) avant `subscribe`.
- Tout calcul via `services/lebalma.service.js` ; paramètres dans `LEBALMA_CONFIG` (jamais « en dur » ailleurs).
- Montants calculés **côté serveur uniquement**.

## 6. Base de données
- Dév : `sequelize.sync({ alter: true })` au démarrage.
- **Prod : ne pas utiliser `sync`** → migrations Sequelize dédiées.
- Seed de démo : `npm run db:seed` (⚠️ `force: true` réinitialise la base).

## 7. Notifications temps réel
- `sockets/index.js` : `notifyUser(userId, …)`, `notifyAdmins(…)`.
- Émettre un event à chaque évènement métier utile (nouvelle commande, paiement confirmé, échéance à venir).

## 8. Definition of Done
- [ ] Respecte l'architecture en couches et le format de réponse.
- [ ] Entrées validées, erreurs gérées, réponses cohérentes.
- [ ] Aucune fuite de secret ni de `password`.
- [ ] Testé (au moins manuellement via un client HTTP) ; `node --check` OK.
- [ ] `STATUT.md` mis à jour.
