# STATUT.md — Backend

Avancement du dépôt **`cheikh-tidiane-apple-backend`**.
**Dernière mise à jour :** 24 juillet 2026
**Phase :** 🟨 Squelette API fonctionnel (à finaliser & connecter aux services externes)

Légende : ⬜ à faire · 🟨 en cours · ✅ terminé · 🧪 en test · ⛔ bloqué

---

## Fondations
| Élément | Statut | Notes |
|---------|--------|-------|
| Setup projet (package.json, ESM) | ✅ | |
| Config Express (app.js, helmet, cors, morgan) | ✅ | |
| Serveur + Socket.IO (server.js) | ✅ | |
| Config Sequelize / MySQL | ✅ | `sync` en dev |
| Config Cloudinary | ✅ | |
| Utils (apiResponse, jwt, mailer, asyncHandler, constants) | ✅ | |
| Middleware erreurs | ✅ | |
| `.env.example` + `.gitignore` | ✅ | |

## Modèles (Sequelize)
| Élément | Statut |
|---------|--------|
| User (+ hooks bcrypt, KYC) | ✅ |
| Category | ✅ |
| Product (variantes JSON, Lebalma) | ✅ |
| Favorite | ✅ |
| Cart / CartItem | ✅ |
| Order / OrderItem | ✅ |
| Payment | ✅ |
| Review | ✅ |
| LebalmaContract / LebalmaInstallment | ✅ |
| Associations (index.js) | ✅ |
| Migrations de production | ⬜ |

## Authentification
| Élément | Statut |
|---------|--------|
| register / login / me | ✅ |
| Middleware protect / restrictTo / adminOnly | ✅ |
| Validators auth | ✅ |
| OTP SMS (optionnel) | ⬜ |
| Reset mot de passe (email) | ⬜ |

## Catalogue
| Élément | Statut |
|---------|--------|
| Liste produits + recherche/filtres/tri/pagination | ✅ |
| Détail produit (+ aperçu Lebalma) | ✅ |
| Catégories (liste) | ✅ |
| CRUD produits (admin) | ✅ |
| Upload images (Multer/Cloudinary) | ✅ |
| Filtres couleur/capacité (colonnes JSON) | 🟨 filtrage en mémoire — à optimiser si gros catalogue |

## Panier / Favoris
| Élément | Statut |
|---------|--------|
| Panier (get/add/update/remove) | ✅ |
| Favoris (list/add/remove) | ✅ |

## Commandes / Paiement
| Élément | Statut |
|---------|--------|
| Création de commande (transaction) | ✅ |
| Mes commandes / détail | ✅ |
| Initiation paiement | 🟨 placeholder passerelle |
| Webhook paiement | 🟨 ⛔ signature à implémenter |
| Intégration Wave / Orange Money / carte | ⬜ |
| Facture / reçu | ⬜ |

## Lebalma
| Élément | Statut |
|---------|--------|
| Service calcul plan + échéancier | ✅ |
| Simulateur (route) | ✅ |
| Souscription + contrat + échéances (KYC) | ✅ |
| Mes contrats | ✅ |
| Paiement d'une échéance | ⬜ |
| Rappels automatiques (cron) | ⬜ |
| Gestion des impayés | ⛔ politique métier à définir |

## Avis / Contenu
| Élément | Statut |
|---------|--------|
| Avis produit (list/create + recalcul note) | ✅ |
| Newsletter (abonnés) | ⬜ |
| Témoignages / Hero slides (admin) | ⬜ |

## Admin
| Élément | Statut |
|---------|--------|
| Dashboard (stats) | ✅ |
| Gestion commandes + statut | ✅ |
| Liste clients | ✅ |
| Gestion promotions | 🟨 via flags produit |

## Temps réel & Qualité
| Élément | Statut |
|---------|--------|
| Socket.IO (notifyUser/notifyAdmins) | ✅ |
| Seed de démo | ✅ |
| Tests unitaires / intégration | ⬜ |
| Rate limiting | ⬜ |
| CI/CD | ⬜ |

---

## ⛔ En attente de décision métier
- Paramètres Lebalma (`LEBALMA_CONFIG`) : % acompte, nb d'échéances, frais, politique d'impayé.
- Choix de la passerelle de paiement (Wave/OM/cartes).

## Journal
| Date | Élément | 
|------|---------|
| 2026-07-24 | Squelette API complet (auth, catalogue, panier, commandes, paiement placeholder, Lebalma, admin, sockets) + docs | 
