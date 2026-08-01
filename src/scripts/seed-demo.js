import 'dotenv/config';
import { Op } from 'sequelize';
import {
  sequelize,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  LebalmaContract,
  LebalmaInstallment,
} from '../models/index.js';
import {
  ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  LEBALMA_CONTRACT_STATUS,
  INSTALLMENT_STATUS,
} from '../utils/constants.js';
import { computeLebalmaPlan, generateSchedule, planFromProduct } from '../services/lebalma.service.js';

/**
 * Jeu de données de DÉMONSTRATION — ADDITIF (ne réinitialise PAS la base).
 * Ajoute : iPhone XR (non Lebalma), des clients, des commandes (tous statuts),
 * des contrats Lebalma (actif / en attente / terminé / en défaut / annulé).
 * Idempotent : ne recrée pas commandes/contrats si des « DEMO-* » existent déjà.
 *   npm run db:seed:demo
 */

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const CLIENTS = [
  { name: 'Awa Ndiaye', email: 'awa@example.com', phone: '+221770000001', city: 'Dakar', address: 'Sacré-Cœur 3', isKycVerified: true },
  { name: 'Modou Fall', email: 'modou@example.com', phone: '+221770000002', city: 'Thiès', address: 'Cité Malick Sy', isKycVerified: true },
  { name: 'Fatou Sarr', email: 'fatou@example.com', phone: '+221770000003', city: 'Dakar', address: 'Liberté 6', isKycVerified: false },
  { name: 'Ibrahima Bâ', email: 'ibrahima@example.com', phone: '+221770000004', city: 'Rufisque', address: 'Keury Kao', isKycVerified: true },
  { name: 'Aïssatou Diop', email: 'aissatou@example.com', phone: '+221770000005', city: 'Dakar', address: 'Point E', isKycVerified: true },
];

async function ensureClients() {
  const users = [];
  for (const c of CLIENTS) {
    const [user] = await User.findOrCreate({
      where: { email: c.email },
      defaults: { ...c, password: 'client123', role: ROLES.CLIENT },
    });
    users.push(user);
  }
  console.log(`👥 ${users.length} clients prêts.`);
  return users;
}

async function ensureDemoAdmin() {
  // Un admin « simple » (non super-admin) pour tester la distinction des rôles.
  const [admin] = await User.findOrCreate({
    where: { email: 'manager@cheikhtidiane.com' },
    defaults: {
      name: 'Awa Gestionnaire',
      email: 'manager@cheikhtidiane.com',
      phone: '+221771112233',
      password: 'admin123',
      role: ROLES.ADMIN,
      isKycVerified: true,
    },
  });
  console.log('🛡️  Admin de démo prêt (manager@cheikhtidiane.com).');
  return admin;
}

async function ensureIphoneXR() {
  const iphone = await Category.findOne({ where: { slug: 'iphone' } });
  const [xr] = await Product.findOrCreate({
    where: { slug: 'iphone-xr' },
    defaults: {
      name: 'iPhone XR',
      model: 'iPhone XR',
      categoryId: iphone?.id,
      description: 'Apple iPhone XR. Modèle non éligible au paiement échelonné Lebalma.',
      price: 95000,
      stock: 20,
      colors: [
        { name: 'Noir', hex: '#1c1c1e' },
        { name: 'Blanc', hex: '#f5f5f7' },
        { name: 'Bleu', hex: '#0A84FF' },
      ],
      storages: ['64 Go', '128 Go', '256 Go'],
      variants: [
        { storage: '64 Go', price: 95000 },
        { storage: '128 Go', price: 110000 },
        { storage: '256 Go', price: 125000 },
      ],
      images: [],
      newAvailable: false,
      lebalmaEligible: false,
    },
  });
  console.log('📱 iPhone XR prêt (non éligible Lebalma).');
  return xr;
}

async function seedOrders(clients, products) {
  const exists = await Order.count({ where: { reference: { [Op.like]: 'DEMO-%' } } });
  if (exists) {
    console.log('🧾 Commandes de démo déjà présentes — ignorées.');
    return;
  }
  const pick = (i) => products[i % products.length];
  // [clientIndex, status, paymentStatus, [ [productIndex, qty], ... ], daysAgo, method]
  const plans = [
    [0, ORDER_STATUS.DELIVERED, PAYMENT_STATUS.SUCCESS, [[3, 1]], 20, PAYMENT_METHODS.WAVE],
    [1, ORDER_STATUS.SHIPPED, PAYMENT_STATUS.SUCCESS, [[5, 1], [8, 1]], 6, PAYMENT_METHODS.ORANGE_MONEY],
    [2, ORDER_STATUS.PENDING, PAYMENT_STATUS.PENDING, [[1, 1]], 1, PAYMENT_METHODS.CARD],
    [3, ORDER_STATUS.PROCESSING, PAYMENT_STATUS.SUCCESS, [[6, 1]], 3, PAYMENT_METHODS.WAVE],
    [4, ORDER_STATUS.PAID, PAYMENT_STATUS.SUCCESS, [[2, 2]], 2, PAYMENT_METHODS.CARD],
    [0, ORDER_STATUS.PAID, PAYMENT_STATUS.SUCCESS, [[7, 1]], 10, PAYMENT_METHODS.ORANGE_MONEY],
    [1, ORDER_STATUS.CANCELLED, PAYMENT_STATUS.FAILED, [[4, 1]], 14, PAYMENT_METHODS.CARD],
    [2, ORDER_STATUS.DELIVERED, PAYMENT_STATUS.SUCCESS, [[0, 1]], 25, PAYMENT_METHODS.WAVE],
    [3, ORDER_STATUS.PENDING, PAYMENT_STATUS.PENDING, [[9, 1]], 0, PAYMENT_METHODS.WAVE],
  ];

  let n = 0;
  for (const [ci, status, pay, lines, ago, method] of plans) {
    const client = clients[ci];
    const items = lines.map(([pi, qty]) => {
      const p = pick(pi);
      return {
        product: p,
        productName: p.name,
        unitPrice: p.price,
        quantity: qty,
        storage: (p.storages && p.storages[0]) || null,
        color: 'Noir',
      };
    });
    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const shippingFee = 2000;
    n += 1;
    const order = await Order.create({
      reference: `DEMO-CMD-${String(n).padStart(3, '0')}`,
      userId: client.id,
      status,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      paymentMethod: method,
      paymentStatus: pay,
      shippingName: client.name,
      shippingPhone: client.phone,
      shippingAddress: client.address,
      shippingCity: client.city,
      createdAt: daysAgo(ago),
      updatedAt: daysAgo(ago),
    });
    for (const it of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: it.product.id,
        productName: it.productName,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        color: it.color,
        storage: it.storage,
      });
    }
  }
  console.log(`🧾 ${n} commandes de démo créées.`);
}

async function seedContracts(clients, eligible) {
  const exists = await LebalmaContract.count({ where: { reference: { [Op.like]: 'DEMO-%' } } });
  if (exists) {
    console.log('💳 Contrats Lebalma de démo déjà présents — ignorés.');
    return;
  }
  if (!eligible.length) {
    console.log('⚠️ Aucun produit éligible Lebalma — contrats ignorés.');
    return;
  }
  const p = (i) => eligible[i % eligible.length];
  // [clientIndex, productIndex, status, paidCount, delivered, startDaysAgo]
  const specs = [
    [0, 0, LEBALMA_CONTRACT_STATUS.ACTIVE, 2, true, 60],
    [1, 1, LEBALMA_CONTRACT_STATUS.PENDING, 0, false, 2],
    [3, 2, LEBALMA_CONTRACT_STATUS.COMPLETED, 'all', true, 200],
    [4, 3, LEBALMA_CONTRACT_STATUS.DEFAULTED, 1, true, 120],
    [0, 4, LEBALMA_CONTRACT_STATUS.CANCELLED, 0, false, 30],
  ];

  let n = 0;
  for (const [ci, pi, status, paid, delivered, startAgo] of specs) {
    const client = clients[ci];
    const product = p(pi);
    const plan = computeLebalmaPlan(product.price, planFromProduct(product));
    const start = daysAgo(startAgo);
    const schedule = generateSchedule(plan, start);
    n += 1;

    const contract = await sequelize.transaction(async (t) => {
      const c = await LebalmaContract.create(
        {
          reference: `DEMO-LEB-${String(n).padStart(3, '0')}`,
          userId: client.id,
          productId: product.id,
          frequency: product.lebalmaFrequency || 'monthly',
          productPrice: plan.productPrice,
          downPaymentPercent: plan.downPaymentPercent,
          downPaymentAmount: plan.downPaymentAmount,
          financedAmount: plan.financedAmount,
          installmentsCount: plan.installmentsCount,
          installmentAmount: plan.installmentAmount,
          totalAmount: plan.totalAmount,
          status,
          startDate: start,
          deviceDeliveredAt: delivered ? start : null,
        },
        { transaction: t }
      );

      const total = schedule.length;
      const paidN = paid === 'all' ? total : Number(paid) || 0;
      for (const step of schedule) {
        let iStatus = INSTALLMENT_STATUS.UPCOMING;
        let paidAt = null;
        if (step.sequence <= paidN) {
          iStatus = INSTALLMENT_STATUS.PAID;
          paidAt = new Date(step.dueDate);
        } else if (status === LEBALMA_CONTRACT_STATUS.DEFAULTED && new Date(step.dueDate) < new Date()) {
          iStatus = INSTALLMENT_STATUS.LATE;
        }
        await LebalmaInstallment.create(
          { contractId: c.id, sequence: step.sequence, dueDate: step.dueDate, amount: step.amount, status: iStatus, paidAt },
          { transaction: t }
        );
      }
      return c;
    });
    void contract;
  }
  console.log(`💳 ${n} contrats Lebalma de démo créés (tous statuts).`);
}

async function run() {
  await sequelize.authenticate();
  console.log('✅ Connexion MySQL établie (mode additif, aucune table réinitialisée).');

  const clients = await ensureClients();
  await ensureDemoAdmin();
  await ensureIphoneXR();

  const products = await Product.findAll({ order: [['id', 'ASC']] });
  const eligible = products.filter((p) => p.lebalmaEligible);

  await seedOrders(clients, products);
  await seedContracts(clients, eligible);

  console.log('🎉 Données de démonstration prêtes.');
  await sequelize.close();
}

run().catch(async (err) => {
  console.error('❌ Seed démo échoué :', err);
  try { await sequelize.close(); } catch { /* noop */ }
  process.exit(1);
});
