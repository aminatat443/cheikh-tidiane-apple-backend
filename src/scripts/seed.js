import 'dotenv/config';
import { sequelize, User, Category, Product } from '../models/index.js';
import { ROLES, LEBALMA_FREQUENCY } from '../utils/constants.js';

/**
 * Jeu de données réel : catalogue iPhone avec barème Lebalma par variante.
 * Lancer avec : npm run db:seed  (⚠️ réinitialise la base)
 *
 * Barème Lebalma (source : affiches boutique) :
 *   - iPhone 11 / 12 / 13 : 3 mois, acompte 40 %, reste ×1,6
 *   - iPhone 14 / 16 / 17 : 6 mois, acompte 60 %, reste ×1,7
 * Mensualité = (prix − acompte) × multiplicateur ÷ nombre de mois.
 */

const COLORS = [
  { name: 'Noir', hex: '#1c1c1e' },
  { name: 'Blanc', hex: '#f5f5f7' },
  { name: 'Bleu', hex: '#0A84FF' },
];

// Familles + variantes (prix cash en FCFA)
const FAMILIES = [
  {
    model: 'iPhone 11', dp: 40, months: 3, mult: 1.6,
    variants: [
      { v: '', s: '64 Go', price: 120000 },
      { v: '', s: '128 Go', price: 130000 },
      { v: 'Pro', s: '64 Go', price: 150000 },
      { v: 'Pro', s: '256 Go', price: 160000 },
      { v: 'Pro Max', s: '64 Go', price: 160000 },
      { v: 'Pro Max', s: '256 Go', price: 170000 },
    ],
  },
  {
    model: 'iPhone 12', dp: 40, months: 3, mult: 1.6,
    variants: [
      { v: '', s: '64 Go', price: 140000 },
      { v: '', s: '128 Go', price: 150000 },
      { v: 'Pro', s: '128 Go', price: 170000 },
      { v: 'Pro', s: '256 Go', price: 180000 },
      { v: 'Pro Max', s: '128 Go', price: 220000 },
      { v: 'Pro Max', s: '256 Go', price: 230000 },
    ],
  },
  {
    model: 'iPhone 13', dp: 40, months: 3, mult: 1.6,
    variants: [
      { v: '', s: '128 Go', price: 180000 },
      { v: 'Pro', s: '128 Go', price: 230000 },
      { v: 'Pro Max', s: '128 Go', price: 250000 },
      { v: 'Pro Max', s: '256 Go', price: 260000 },
    ],
  },
  {
    model: 'iPhone 14', dp: 60, months: 6, mult: 1.7, topSale: true, newAvail: true,
    variants: [
      { v: '', s: '128 Go', price: 220000 },
      { v: '', s: '256 Go', price: 240000 },
      { v: 'Plus', s: '128 Go', price: 240000 },
      { v: 'Plus', s: '256 Go', price: 260000 },
      { v: 'Pro', s: '128 Go', price: 300000 },
      { v: 'Pro', s: '256 Go', price: 320000 },
      { v: 'Pro Max', s: '128 Go', price: 320000 },
      { v: 'Pro Max', s: '256 Go', price: 350000 },
    ],
  },
  {
    model: 'iPhone 16', dp: 60, months: 6, mult: 1.7, isNew: true, newAvail: true,
    variants: [
      { v: '', s: '128 Go', price: 380000 },
      { v: '', s: '256 Go', price: 430000 },
      { v: 'Plus', s: '128 Go', price: 420000 },
      { v: 'Plus', s: '256 Go', price: 450000 },
      { v: 'Pro', s: '128 Go', price: 430000 },
      { v: 'Pro', s: '256 Go', price: 480000, featured: true },
      { v: 'Pro Max', s: '256 Go', price: 540000 },
    ],
  },
  {
    model: 'iPhone 17', dp: 60, months: 6, mult: 1.7, isNew: true, newAvail: true,
    variants: [
      { v: 'Air', s: '256 Go', price: 550000 },
      { v: 'Pro eSIM', s: '256 Go', price: 700000 },
      { v: 'Pro Max eSIM', s: '256 Go', price: 800000 },
      { v: 'Pro SIM', s: '256 Go', price: 750000 },
      { v: 'Pro Max SIM', s: '256 Go', price: 900000 },
    ],
  },
];

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('🗑️  Base réinitialisée.');

  await User.create({
    name: 'Cheikh Tidiane',
    email: 'admin@cheikhtidiane.com',
    password: 'admin123',
    role: ROLES.SUPERADMIN, // super-admin : peut créer/gérer les autres admins
    isKycVerified: true,
  });

  const [iphone, ipad, macbook] = await Promise.all([
    Category.create({ name: 'iPhone', slug: 'iphone' }),
    Category.create({ name: 'iPad', slug: 'ipad' }),
    Category.create({ name: 'MacBook', slug: 'macbook' }),
  ]);

  const products = [];
  for (const fam of FAMILIES) {
    // Regroupe les variantes par déclinaison (Pro, Pro Max…) → 1 produit par modèle
    const groups = {};
    for (const variant of fam.variants) {
      (groups[variant.v] ||= []).push({ storage: variant.s, price: variant.price });
    }
    for (const [v, vars] of Object.entries(groups)) {
      // Toujours indiquer la déclinaison : Simple / Pro / Pro Max / Plus / Air…
      const model = `${fam.model} ${v || 'Simple'}`;
      const basePrice = Math.min(...vars.map((x) => x.price));
      products.push({
        name: model,
        slug: slugify(model),
        model,
        description: `Apple ${model}. Éligible au paiement échelonné Lebalma sur ${fam.months} mois.`,
        categoryId: iphone.id,
        price: basePrice, // prix « à partir de » (capacité la moins chère)
        stock: 15,
        colors: COLORS,
        storages: vars.map((x) => x.storage),
        variants: vars, // [{ storage, price }]
        images: [],
        newAvailable: !!fam.newAvail, // version « Neuf » à partir de l'iPhone 14
        isNew: !!fam.isNew,
        isTopSale: !!fam.topSale && v === 'Pro',
        isFeatured: fam.model === 'iPhone 16' && v === 'Pro',
        lebalmaEligible: true,
        lebalmaFrequency: LEBALMA_FREQUENCY.MONTHLY,
        lebalmaDownPercent: fam.dp,
        lebalmaMonths: fam.months,
        lebalmaMultiplier: fam.mult,
      });
    }
  }

  // iPhone XR — NON éligible au financement Lebalma (modèle plus ancien)
  products.push({
    name: 'iPhone XR', slug: 'iphone-xr', model: 'iPhone XR', categoryId: iphone.id,
    description: 'Apple iPhone XR. Modèle non éligible au paiement échelonné Lebalma.',
    price: 95000, stock: 20, colors: COLORS,
    storages: ['64 Go', '128 Go', '256 Go'],
    variants: [
      { storage: '64 Go', price: 95000 },
      { storage: '128 Go', price: 110000 },
      { storage: '256 Go', price: 125000 },
    ],
    images: [], newAvailable: false, lebalmaEligible: false,
  });

  // Quelques produits hors iPhone (non éligibles Lebalma pour l'instant)
  products.push(
    {
      name: 'iPad Air', slug: 'ipad-air', model: 'iPad Air', categoryId: ipad.id,
      price: 480000, stock: 6, storages: ['64 Go', '256 Go'], colors: COLORS, images: [], newAvailable: true,
    },
    {
      name: 'MacBook Air M2', slug: 'macbook-air-m2', model: 'MacBook Air', categoryId: macbook.id,
      price: 900000, stock: 4, storages: ['256 Go', '512 Go'], colors: COLORS, images: [], newAvailable: true,
    }
  );

  await Product.bulkCreate(products);
  const eligible = products.filter((p) => p.lebalmaEligible).length;
  console.log(`✅ ${products.length} produits insérés (dont ${eligible} éligibles Lebalma, iPhone XR exclu).`);
  await sequelize.close();
}

seed().catch((err) => {
  console.error('❌ Seed échoué :', err);
  process.exit(1);
});
