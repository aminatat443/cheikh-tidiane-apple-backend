-- Import PostgreSQL généré depuis le dump MySQL.
-- Les tables doivent déjà exister (créées par Sequelize / npm run db:seed).
-- MODE REMPLACEMENT : les tables sont VIDÉES puis rechargées (IDs exacts).

SET client_encoding TO 'UTF8';

BEGIN;

TRUNCATE "categories", "users", "products", "carts", "cart_items", "orders", "order_items", "reviews", "lebalma_contracts", "lebalma_installments", "payments", "notifications", "feedbacks" RESTART IDENTITY CASCADE;

-- categories (3 ligne(s))
INSERT INTO "categories" ("id", "name", "slug", "description", "image", "createdAt", "updatedAt") VALUES
  (1, 'iPhone', 'iphone', NULL, NULL, '2026-07-30 01:51:43', '2026-07-30 01:51:43'),
  (2, 'iPad', 'ipad', NULL, NULL, '2026-07-30 01:51:43', '2026-07-30 01:51:43'),
  (3, 'MacBook', 'macbook', NULL, NULL, '2026-07-30 01:51:43', '2026-07-30 01:51:43')
ON CONFLICT DO NOTHING;

-- users (10 ligne(s))
INSERT INTO "users" ("id", "name", "email", "password", "phone", "role", "address", "city", "avatar", "isKycVerified", "idDocumentUrl", "createdAt", "updatedAt", "twoFactorEnabled", "twoFactorSecret", "idCardFrontUrl", "idCardBackUrl", "idNin", "idBirthDate", "idExpiryDate", "deliveryZone") VALUES
  (1, 'Cheikh Tidiane', 'admin@cheikhtidiane.com', '$2a$10$yAv9jU1ug/c0VyvbF8LDf.nPK4BGhx4lOmSlHz2i7/ZRogBbqZ4eq', NULL, 'superadmin', NULL, NULL, NULL, true, NULL, '2026-07-30 01:51:42', '2026-08-02 21:40:13', true, 'JFICM2KWKQVHGUDTI5QVU5DGPBKVAIZQJZ3HKT2OIZTWMY3WIRUQ', NULL, NULL, NULL, NULL, NULL, NULL),
  (2, 'Awa Ndiaye', 'awa@example.com', '$2a$10$zHTJjb3odixmV2F0wUnObOkvsEinnFh952AhrCd.5XzWjJJkrTrrG', '+221771112233', 'client', 'Gu�diawaye Cit�', 'Dakar', NULL, true, NULL, '2026-07-31 12:10:06', '2026-08-02 23:52:41', false, NULL, NULL, NULL, NULL, NULL, NULL, 'pikine-guediawaye'),
  (3, 'Modou Fall', 'modou@example.com', '$2a$10$nMrVrTMX7Xs7jUglyEDJSOhaRfRMnyMkcoLln2R84NhbLqhJ4dPQi', '+221770000002', 'client', 'Cité Malick Sy', 'Thiès', NULL, true, NULL, '2026-07-31 12:10:07', '2026-07-31 12:10:07', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (4, 'Fatou Sarr', 'fatou@example.com', '$2a$10$PGC.p.t/vPZPzkT2AwOGq.CM0ScFZXK7suZFUMIk22iAdaqyomfwq', '+221770000003', 'client', 'Liberté 6', 'Dakar', NULL, false, NULL, '2026-07-31 12:10:07', '2026-07-31 12:10:07', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (5, 'Ibrahima Bâ', 'ibrahima@example.com', '$2a$10$QF1ZEmEB6/ajf/R2PkXkkO2q5/d86YRfix85g1DHVOkGD4AJwAqiC', '+221770000004', 'client', 'Keury Kao', 'Rufisque', NULL, true, NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (6, 'Aïssatou Diop', 'aissatou@example.com', '$2a$10$McYMc0.3X0E4eCyP6cHOGOTEq.g9FCwStxN/UQR2Z.VHFgaATblfS', '+221770000005', 'client', 'Point E', 'Dakar', NULL, true, NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (7, 'Pay Test', 'pay_test_1785533536340@example.com', '$2a$10$DfmC4QH/mbJtGGZdY5SuaunEyii./rCGpOssdDIcyloAOGvDTf1tu', '770000000', 'client', NULL, NULL, NULL, false, NULL, '2026-07-31 21:32:16', '2026-07-31 21:32:16', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (8, 'Awa Gestionnaire', 'manager@cheikhtidiane.com', '$2a$10$Ei5YjeNQZaW/0UZxvsDo8O/DMtjDpSwFS62b51RIDp5MIofW8HF0i', '+221771112233', 'admin', NULL, NULL, NULL, true, NULL, '2026-07-31 21:44:59', '2026-07-31 22:49:42', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (9, 'aminata traore', 'aminatat1553@gmail.com', '$2a$10$I8.aUIHQr2EpXP/DFccomOTH./w66Ts0f0IvkmMBia6qCpnWcii8a', '+221708289273', 'client', '136 rue DK0001N01', NULL, 'https://lh3.googleusercontent.com/a/ACg8ocIFLAemONZskP8i_UjGCy-VvAa0cx_qZm7oLXoLCQUkHR1iFg=s96-c', false, NULL, '2026-08-02 21:50:59', '2026-08-02 23:55:47', false, NULL, NULL, NULL, NULL, NULL, NULL, 'keur-massar-malika'),
  (10, 'Vente au comptoir', 'comptoir@cheikhtidiane.local', '$2a$10$NOjYN5ISe7qhsawXT4q17.biEXPMoXyVbc8znYI0e3d3XfJvHT.cm', NULL, 'client', NULL, NULL, NULL, false, NULL, '2026-08-11 12:51:25', '2026-08-11 12:51:25', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- products (25 ligne(s))
INSERT INTO "products" ("id", "name", "slug", "description", "model", "price", "oldPrice", "stock", "colors", "storages", "variants", "images", "specs", "newAvailable", "isPromo", "isFeatured", "isTopSale", "isNew", "soldCount", "ratingAvg", "ratingCount", "lebalmaEligible", "lebalmaFrequency", "lebalmaDownPercent", "lebalmaMonths", "lebalmaMultiplier", "createdAt", "updatedAt", "categoryId") VALUES
  (1, 'iPhone 11 Simple', 'iphone-11-simple', 'Apple iPhone 11 Simple. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 11 Simple', 120000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["64 Go","128 Go"]', '[{"storage":"64 Go","price":120000},{"storage":"128 Go","price":130000}]', '[]', '{}', false, false, false, false, true, 0, 5, 1, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 17:02:52', 1),
  (2, 'iPhone 11 Pro', 'iphone-11-pro', 'Apple iPhone 11 Pro. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 11 Pro', 150000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["64 Go","256 Go"]', '[{"storage":"64 Go","price":150000},{"storage":"256 Go","price":160000}]', '[]', '{}', false, false, false, false, false, 0, 4.7, 29, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (3, 'iPhone 11 Pro Max', 'iphone-11-pro-max', 'Apple iPhone 11 Pro Max. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 11 Pro Max', 160000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["64 Go","256 Go"]', '[{"storage":"64 Go","price":160000},{"storage":"256 Go","price":170000}]', '[]', '{}', false, false, false, false, false, 0, 4.8, 44, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (4, 'iPhone 12 Simple', 'iphone-12-simple', 'Apple iPhone 12 Simple. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 12 Simple', 140000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["64 Go","128 Go"]', '[{"storage":"64 Go","price":140000},{"storage":"128 Go","price":150000}]', '[]', '{}', false, false, false, false, false, 0, 4.8, 44, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (5, 'iPhone 12 Pro', 'iphone-12-pro', 'Apple iPhone 12 Pro. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 12 Pro', 170000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":170000},{"storage":"256 Go","price":180000}]', '[]', '{}', false, false, false, false, false, 0, 4.9, 39, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (6, 'iPhone 12 Pro Max', 'iphone-12-pro-max', 'Apple iPhone 12 Pro Max. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 12 Pro Max', 220000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":220000},{"storage":"256 Go","price":230000}]', '[]', '{}', false, false, false, false, false, 0, 4.1, 22, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (7, 'iPhone 13 Simple', 'iphone-13-simple', 'Apple iPhone 13 Simple. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 13 Simple', 180000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go"]', '[{"storage":"128 Go","price":180000}]', '[]', '{}', false, false, false, false, false, 0, 4.5, 27, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (8, 'iPhone 13 Pro', 'iphone-13-pro', 'Apple iPhone 13 Pro. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 13 Pro', 230000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go"]', '[{"storage":"128 Go","price":230000}]', '[]', '{}', false, false, false, false, false, 0, 4.8, 40, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (9, 'iPhone 13 Pro Max', 'iphone-13-pro-max', 'Apple iPhone 13 Pro Max. Éligible au paiement échelonné Lebalma sur 3 mois.', 'iPhone 13 Pro Max', 250000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":250000},{"storage":"256 Go","price":260000}]', '[]', '{}', false, false, false, false, false, 0, 4.9, 7, true, 'monthly', 40, 3, 1.6, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (10, 'iPhone 14 Simple', 'iphone-14-simple', 'Apple iPhone 14 Simple. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 14 Simple', 220000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":220000},{"storage":"256 Go","price":240000}]', '[]', '{}', true, false, false, false, true, 0, 4.6, 11, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (11, 'iPhone 14 Plus', 'iphone-14-plus', 'Apple iPhone 14 Plus. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 14 Plus', 240000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":240000},{"storage":"256 Go","price":260000}]', '[]', '{}', true, false, false, false, true, 0, 4.3, 24, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (12, 'iPhone 14 Pro', 'iphone-14-pro', 'Apple iPhone 14 Pro. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 14 Pro', 300000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":300000},{"storage":"256 Go","price":320000}]', '[]', '{}', true, false, false, true, true, 0, 4.3, 44, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (13, 'iPhone 14 Pro Max', 'iphone-14-pro-max', 'Apple iPhone 14 Pro Max. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 14 Pro Max', 320000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":320000},{"storage":"256 Go","price":350000}]', '[]', '{}', true, false, false, false, false, 0, 4.3, 8, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (14, 'iPhone 16 Simple', 'iphone-16-simple', 'Apple iPhone 16 Simple. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 16 Simple', 380000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":380000},{"storage":"256 Go","price":430000}]', '[]', '{}', true, false, false, false, true, 0, 4.2, 46, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (15, 'iPhone 16 Plus', 'iphone-16-plus', 'Apple iPhone 16 Plus. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 16 Plus', 420000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":420000},{"storage":"256 Go","price":450000}]', '[]', '{}', true, false, false, false, true, 0, 4.8, 31, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (16, 'iPhone 16 Pro', 'iphone-16-pro', 'Apple iPhone 16 Pro. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 16 Pro', 430000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["128 Go","256 Go"]', '[{"storage":"128 Go","price":430000},{"storage":"256 Go","price":480000}]', '[]', '{}', true, false, true, false, true, 0, 4.8, 13, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (17, 'iPhone 16 Pro Max', 'iphone-16-pro-max', 'Apple iPhone 16 Pro Max. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 16 Pro Max', 540000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["256 Go"]', '[{"storage":"256 Go","price":540000}]', '[]', '{}', true, false, false, false, true, 0, 4.2, 24, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (18, 'iPhone 17 Air', 'iphone-17-air', 'Apple iPhone 17 Air. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 17 Air', 550000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["256 Go"]', '[{"storage":"256 Go","price":550000}]', '[]', '{}', true, false, false, false, true, 0, 4.8, 11, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (19, 'iPhone 17 Pro eSIM', 'iphone-17-pro-esim', 'Apple iPhone 17 Pro eSIM. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 17 Pro eSIM', 700000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["256 Go"]', '[{"storage":"256 Go","price":700000}]', '[]', '{}', true, false, false, false, true, 0, 4.6, 47, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (20, 'iPhone 17 Pro Max eSIM', 'iphone-17-pro-max-esim', 'Apple iPhone 17 Pro Max eSIM. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 17 Pro Max eSIM', 800000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["256 Go"]', '[{"storage":"256 Go","price":800000}]', '[]', '{}', true, false, false, false, true, 0, 4.3, 14, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (21, 'iPhone 17 Pro SIM', 'iphone-17-pro-sim', 'Apple iPhone 17 Pro SIM. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 17 Pro SIM', 750000, NULL, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["256 Go"]', '[{"storage":"256 Go","price":750000}]', '[]', '{}', true, false, false, false, true, 0, 4.9, 43, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 1),
  (22, 'iPhone 17 Pro Max SIM', 'iphone-17-pro-max-sim', 'Apple iPhone 17 Pro Max SIM. Éligible au paiement échelonné Lebalma sur 6 mois.', 'iPhone 17 Pro Max SIM', 900000, 1125000, 15, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["256 Go"]', '[{"storage":"256 Go","price":900000}]', '[]', '{}', true, true, false, false, true, 0, 4.4, 10, true, 'monthly', 60, 6, 1.7, '2026-07-30 01:51:43', '2026-08-09 01:55:58', 1),
  (23, 'iPad Air', 'ipad-air', NULL, 'iPad Air', 480000, NULL, 6, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["64 Go","256 Go"]', '[]', '[]', '{}', true, false, false, false, false, 0, 4.8, 33, false, 'monthly', 0, 0, 1, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 2),
  (24, 'MacBook Air M2', 'macbook-air-m2', NULL, 'MacBook Air', 900000, NULL, 4, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["256 Go","512 Go"]', '[]', '[]', '{}', true, false, false, false, false, 0, 4.7, 10, false, 'monthly', 0, 0, 1, '2026-07-30 01:51:43', '2026-08-06 13:40:07', 3),
  (25, 'iPhone XR', 'iphone-xr', 'Apple iPhone XR. Modèle non éligible au paiement échelonné Lebalma.', 'iPhone XR', 95000, 118750, 20, '[{"name":"Noir","hex":"#1c1c1e"},{"name":"Blanc","hex":"#f5f5f7"},{"name":"Bleu","hex":"#0A84FF"}]', '["64 Go","128 Go","256 Go"]', '[{"storage":"64 Go","price":95000},{"storage":"128 Go","price":110000},{"storage":"256 Go","price":125000}]', '["https://res.cloudinary.com/nepexwaa/image/upload/v1786461124/cheikh-tidiane-apple/products/rlpdj4bse0rbcnx955vy.jpg","https://res.cloudinary.com/nepexwaa/image/upload/v1786461126/cheikh-tidiane-apple/products/dm9xsv5lxvncl3caf3bl.jpg","https://res.cloudinary.com/nepexwaa/image/upload/v1786461127/cheikh-tidiane-apple/products/grscpw0imqjkpblnyck0.jpg","https://res.cloudinary.com/nepexwaa/image/upload/v1786461128/cheikh-tidiane-apple/products/sw7kfbdscnlh0bm08ys7.jpg","https://res.cloudinary.com/nepexwaa/image/upload/v1786461129/cheikh-tidiane-apple/products/usxgiiks3ihokgz6i1py.jpg"]', '{}', false, true, false, false, false, 0, 4.2, 33, false, NULL, 0, 0, 1, '2026-07-31 12:10:08', '2026-08-11 15:12:14', 1)
ON CONFLICT DO NOTHING;

-- carts (1 ligne(s))
INSERT INTO "carts" ("id", "userId", "createdAt", "updatedAt", "reminderSentAt") VALUES
  (1, 7, '2026-07-31 21:32:17', '2026-07-31 21:32:17', NULL)
ON CONFLICT DO NOTHING;

-- orders (13 ligne(s))
INSERT INTO "orders" ("id", "reference", "userId", "status", "subtotal", "shippingFee", "total", "paymentMethod", "paymentStatus", "isLebalma", "shippingName", "shippingPhone", "shippingAddress", "shippingCity", "createdAt", "updatedAt") VALUES
  (1, 'DEMO-CMD-001', 2, 'delivered', 140000, 2000, 142000, 'wave', 'success', false, 'Awa Ndiaye', '+221770000001', 'Sacré-Cœur 3', 'Dakar', '2026-07-11 12:10:08', '2026-07-31 12:10:08'),
  (2, 'DEMO-CMD-002', 3, 'shipped', 470000, 2000, 472000, 'orange_money', 'success', false, 'Modou Fall', '+221770000002', 'Cité Malick Sy', 'Thiès', '2026-07-25 12:10:08', '2026-07-31 12:10:08'),
  (3, 'DEMO-CMD-003', 4, 'pending', 150000, 2000, 152000, 'card', 'pending', false, 'Fatou Sarr', '+221770000003', 'Liberté 6', 'Dakar', '2026-07-30 12:10:08', '2026-07-31 12:10:08'),
  (4, 'DEMO-CMD-004', 5, 'processing', 180000, 2000, 182000, 'wave', 'success', false, 'Ibrahima Bâ', '+221770000004', 'Keury Kao', 'Rufisque', '2026-07-28 12:10:08', '2026-07-31 12:10:08'),
  (5, 'DEMO-CMD-005', 6, 'paid', 320000, 2000, 322000, 'card', 'success', false, 'Aïssatou Diop', '+221770000005', 'Point E', 'Dakar', '2026-07-29 12:10:08', '2026-07-31 12:10:08'),
  (6, 'DEMO-CMD-006', 2, 'paid', 230000, 2000, 232000, 'orange_money', 'success', false, 'Awa Ndiaye', '+221770000001', 'Sacré-Cœur 3', 'Dakar', '2026-07-21 12:10:08', '2026-07-31 12:10:08'),
  (7, 'DEMO-CMD-007', 3, 'cancelled', 170000, 2000, 172000, 'card', 'failed', false, 'Modou Fall', '+221770000002', 'Cité Malick Sy', 'Thiès', '2026-07-17 12:10:08', '2026-07-31 12:10:08'),
  (8, 'DEMO-CMD-008', 4, 'delivered', 120000, 2000, 122000, 'wave', 'success', false, 'Fatou Sarr', '+221770000003', 'Liberté 6', 'Dakar', '2026-07-06 12:10:08', '2026-07-31 12:10:08'),
  (9, 'DEMO-CMD-009', 5, 'pending', 220000, 2000, 222000, 'wave', 'pending', false, 'Ibrahima Bâ', '+221770000004', 'Keury Kao', 'Rufisque', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (10, 'CMD-MS9GKEYG', 7, 'paid', 95000, 0, 95000, 'wave', 'success', false, 'Pay Test', '770', 'Dakar', 'Dakar', '2026-07-31 21:32:17', '2026-07-31 21:32:17'),
  (11, 'CMD-MSCCQTVO', 2, 'pending', 190000, 2000, 192000, 'wave', 'pending', false, 'Awa Ndiaye', '+221770000001', 'Ngor Almadies', 'Almadies / Ngor / Yoff', '2026-08-02 22:08:36', '2026-08-02 22:08:36'),
  (12, 'CMD-MSCGKNQ0', 9, 'paid', 150000, 1000, 151000, 'wave', 'success', false, 'aminata traore', '+221708289273', '136 rue DK0001N01', 'Keur Massar / Malika', '2026-08-02 23:55:47', '2026-08-02 23:55:54'),
  (13, 'CMD-MSONSY2M', 10, 'paid', 95000, 0, 95000, 'cash', 'success', false, 'Ibrahima Mbaye', '700005200', NULL, NULL, '2026-08-11 12:51:25', '2026-08-11 12:51:25')
ON CONFLICT DO NOTHING;

-- order_items (14 ligne(s))
INSERT INTO "order_items" ("id", "orderId", "productId", "productName", "unitPrice", "quantity", "color", "storage", "createdAt", "updatedAt") VALUES
  (1, 1, 4, 'iPhone 12 Simple', 140000, 1, 'Noir', '64 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (2, 2, 6, 'iPhone 12 Pro Max', 220000, 1, 'Noir', '128 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (3, 2, 9, 'iPhone 13 Pro Max', 250000, 1, 'Noir', '128 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (4, 3, 2, 'iPhone 11 Pro', 150000, 1, 'Noir', '64 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (5, 4, 7, 'iPhone 13 Simple', 180000, 1, 'Noir', '128 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (6, 5, 3, 'iPhone 11 Pro Max', 160000, 2, 'Noir', '64 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (7, 6, 8, 'iPhone 13 Pro', 230000, 1, 'Noir', '128 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (8, 7, 5, 'iPhone 12 Pro', 170000, 1, 'Noir', '128 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (9, 8, 1, 'iPhone 11 Simple', 120000, 1, 'Noir', '64 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (10, 9, 10, 'iPhone 14 Simple', 220000, 1, 'Noir', '128 Go', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (11, 10, 25, 'iPhone XR', 95000, 1, NULL, NULL, '2026-07-31 21:32:17', '2026-07-31 21:32:17'),
  (12, 11, 25, 'iPhone XR', 95000, 2, NULL, NULL, '2026-08-02 22:08:36', '2026-08-02 22:08:36'),
  (13, 12, 2, 'iPhone 11 Pro', 150000, 1, 'Noir', '64 Go', '2026-08-02 23:55:47', '2026-08-02 23:55:47'),
  (14, 13, 25, 'iPhone XR', 95000, 1, NULL, NULL, '2026-08-11 12:51:25', '2026-08-11 12:51:25')
ON CONFLICT DO NOTHING;

-- reviews (2 ligne(s))
INSERT INTO "reviews" ("id", "userId", "productId", "rating", "comment", "isApproved", "createdAt", "updatedAt") VALUES
  (1, 2, 25, 5, 'Excellent produit, livraison rapide !', true, '2026-08-06 13:32:21', '2026-08-06 13:32:21'),
  (2, 9, 1, 5, 'Excelent !', true, '2026-08-06 17:02:52', '2026-08-06 17:02:52')
ON CONFLICT DO NOTHING;

-- lebalma_contracts (5 ligne(s))
INSERT INTO "lebalma_contracts" ("id", "reference", "userId", "productId", "orderId", "frequency", "productPrice", "downPaymentPercent", "downPaymentAmount", "financedAmount", "installmentsCount", "installmentAmount", "totalAmount", "status", "startDate", "deviceDeliveredAt", "createdAt", "updatedAt") VALUES
  (1, 'DEMO-LEB-001', 2, 1, NULL, 'monthly', 120000, 40, 48000, 115200, 3, 38400, 163200, 'completed', '2026-06-01', '2026-06-01 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:28:12'),
  (2, 'DEMO-LEB-002', 3, 2, NULL, 'monthly', 150000, 40, 60000, 144000, 3, 48000, 204000, 'active', '2026-07-29', '2026-07-31 22:02:32', '2026-07-31 12:10:08', '2026-07-31 22:02:32'),
  (3, 'DEMO-LEB-003', 5, 3, NULL, 'monthly', 160000, 40, 64000, 153600, 3, 51200, 217600, 'completed', '2026-01-12', '2026-01-12 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (4, 'DEMO-LEB-004', 6, 4, NULL, 'monthly', 140000, 40, 56000, 134400, 3, 44800, 190400, 'defaulted', '2026-04-02', '2026-04-02 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08'),
  (5, 'DEMO-LEB-005', 2, 5, NULL, 'monthly', 170000, 40, 68000, 163200, 3, 54400, 231200, 'active', '2026-07-01', NULL, '2026-07-31 12:10:08', '2026-07-31 22:52:15')
ON CONFLICT DO NOTHING;

-- lebalma_installments (15 ligne(s))
INSERT INTO "lebalma_installments" ("id", "contractId", "sequence", "dueDate", "amount", "status", "paidAt", "createdAt", "updatedAt", "paymentMethod", "paymentInitiatedAt") VALUES
  (1, 1, 1, '2026-07-01', 38400, 'paid', '2026-07-01 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (2, 1, 2, '2026-08-01', 38400, 'paid', '2026-08-01 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (3, 1, 3, '2026-09-01', 38400, 'paid', '2026-07-31 12:28:11', '2026-07-31 12:10:08', '2026-07-31 12:28:11', NULL, NULL),
  (4, 2, 1, '2026-08-29', 48000, 'upcoming', NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (5, 2, 2, '2026-09-29', 48000, 'upcoming', NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (6, 2, 3, '2026-10-29', 48000, 'upcoming', NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (7, 3, 1, '2026-02-12', 51200, 'paid', '2026-02-12 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (8, 3, 2, '2026-03-12', 51200, 'paid', '2026-03-12 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (9, 3, 3, '2026-04-12', 51200, 'paid', '2026-04-12 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (10, 4, 1, '2026-05-02', 44800, 'paid', '2026-05-02 12:10:08', '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (11, 4, 2, '2026-06-02', 44800, 'late', NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (12, 4, 3, '2026-07-02', 44800, 'late', NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (13, 5, 1, '2026-08-01', 54400, 'paid', '2026-07-31 22:52:15', '2026-07-31 12:10:08', '2026-07-31 22:52:15', NULL, NULL),
  (14, 5, 2, '2026-09-01', 54400, 'upcoming', NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL),
  (15, 5, 3, '2026-10-01', 54400, 'upcoming', NULL, '2026-07-31 12:10:08', '2026-07-31 12:10:08', NULL, NULL)
ON CONFLICT DO NOTHING;

-- payments (3 ligne(s))
INSERT INTO "payments" ("id", "orderId", "installmentId", "userId", "method", "amount", "status", "providerRef", "rawResponse", "createdAt", "updatedAt", "purpose", "provider", "idempotencyKey") VALUES
  (1, 10, NULL, 7, 'wave', 95000, 'success', 'SIM-1', NULL, '2026-07-31 21:32:17', '2026-07-31 21:32:17', 'order', 'simulation', 'PAY-order-10-ms9gkf2y-36f48b'),
  (2, NULL, 13, 2, 'wave', 54400, 'success', 'SIM-2', NULL, '2026-07-31 22:51:59', '2026-07-31 22:52:15', 'installment', 'simulation', 'PAY-installment-13-ms9jewn1-463d74'),
  (3, 12, NULL, 9, 'wave', 151000, 'success', 'SIM-3', NULL, '2026-08-02 23:55:47', '2026-08-02 23:55:54', 'order', 'simulation', 'PAY-order-12-mscgknv8-d084b2')
ON CONFLICT DO NOTHING;

-- notifications (12 ligne(s))
INSERT INTO "notifications" ("id", "userId", "type", "title", "message", "link", "isRead", "createdAt", "updatedAt") VALUES
  (1, 2, 'lebalma_installment', 'Contrat Lebalma soldé', 'Félicitations ! Votre contrat DEMO-LEB-001 est entièrement réglé.', '/orders', false, '2026-07-31 12:28:12', '2026-07-31 12:28:12'),
  (2, 7, 'order_confirm', 'Commande enregistrée', 'Votre commande CMD-MS9GKEYG a bien été reçue. Total : 95 000 FCFA.', '/orders', false, '2026-07-31 21:32:17', '2026-07-31 21:32:17'),
  (3, 7, 'order_paid', 'Paiement confirmé', 'Le paiement de votre commande CMD-MS9GKEYG (95 000 FCFA) est confirmé.', '/orders', false, '2026-07-31 21:32:17', '2026-07-31 21:32:17'),
  (4, 3, 'lebalma_delivered', 'Appareil remis', 'Votre appareil (contrat DEMO-LEB-002) a été remis. Bon usage !', '/orders', false, '2026-07-31 22:02:32', '2026-07-31 22:02:32'),
  (5, 2, 'lebalma_installment', 'Échéance réglée', 'Échéance n°1 du contrat DEMO-LEB-005 réglée (54 400 FCFA).', '/mes-financements', true, '2026-07-31 22:52:15', '2026-07-31 22:52:32'),
  (6, 8, 'lebalma_installment', 'Échéance Lebalma payée', 'Échéance n°1 — contrat DEMO-LEB-005 (54 400 FCFA).', '/admin/lebalma', false, '2026-07-31 22:52:15', '2026-07-31 22:52:15'),
  (7, 8, 'order_new', 'Nouvelle commande', 'Commande CMD-MSCCQTVO — 192 000 FCFA', '/admin/orders', false, '2026-08-02 22:08:36', '2026-08-02 22:08:36'),
  (8, 2, 'order_confirm', 'Commande enregistrée', 'Votre commande CMD-MSCCQTVO a bien été reçue. Total : 192 000 FCFA.', '/orders', false, '2026-08-02 22:08:36', '2026-08-02 22:08:36'),
  (9, 8, 'order_new', 'Nouvelle commande', 'Commande CMD-MSCGKNQ0 — 151 000 FCFA', '/admin/orders', false, '2026-08-02 23:55:47', '2026-08-02 23:55:47'),
  (10, 9, 'order_confirm', 'Commande enregistrée', 'Votre commande CMD-MSCGKNQ0 a bien été reçue. Total : 151 000 FCFA.', '/orders', false, '2026-08-02 23:55:47', '2026-08-02 23:55:47'),
  (11, 9, 'order_paid', 'Paiement confirmé', 'Le paiement de votre commande CMD-MSCGKNQ0 (151 000 FCFA) est confirmé.', '/orders', false, '2026-08-02 23:55:54', '2026-08-02 23:55:54'),
  (12, 8, 'order_paid', 'Commande payée', 'Commande CMD-MSCGKNQ0 réglée (151 000 FCFA).', '/admin/orders', false, '2026-08-02 23:55:54', '2026-08-02 23:55:54')
ON CONFLICT DO NOTHING;

-- Recale les séquences (id) pour éviter les collisions futures
SELECT setval(pg_get_serial_sequence('"categories"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "categories"), 1));
SELECT setval(pg_get_serial_sequence('"users"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "users"), 1));
SELECT setval(pg_get_serial_sequence('"products"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "products"), 1));
SELECT setval(pg_get_serial_sequence('"carts"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "carts"), 1));
SELECT setval(pg_get_serial_sequence('"orders"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "orders"), 1));
SELECT setval(pg_get_serial_sequence('"order_items"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "order_items"), 1));
SELECT setval(pg_get_serial_sequence('"reviews"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "reviews"), 1));
SELECT setval(pg_get_serial_sequence('"lebalma_contracts"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "lebalma_contracts"), 1));
SELECT setval(pg_get_serial_sequence('"lebalma_installments"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "lebalma_installments"), 1));
SELECT setval(pg_get_serial_sequence('"payments"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "payments"), 1));
SELECT setval(pg_get_serial_sequence('"notifications"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "notifications"), 1));
SELECT setval(pg_get_serial_sequence('"carts"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "carts"), 1));
SELECT setval(pg_get_serial_sequence('"categories"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "categories"), 1));
SELECT setval(pg_get_serial_sequence('"lebalma_contracts"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "lebalma_contracts"), 1));
SELECT setval(pg_get_serial_sequence('"lebalma_installments"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "lebalma_installments"), 1));
SELECT setval(pg_get_serial_sequence('"notifications"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "notifications"), 1));
SELECT setval(pg_get_serial_sequence('"order_items"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "order_items"), 1));
SELECT setval(pg_get_serial_sequence('"orders"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "orders"), 1));
SELECT setval(pg_get_serial_sequence('"payments"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "payments"), 1));
SELECT setval(pg_get_serial_sequence('"products"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "products"), 1));
SELECT setval(pg_get_serial_sequence('"reviews"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "reviews"), 1));
SELECT setval(pg_get_serial_sequence('"users"', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM "users"), 1));

COMMIT;