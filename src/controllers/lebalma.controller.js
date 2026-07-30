import {
  sequelize,
  Product,
  LebalmaContract,
  LebalmaInstallment,
} from '../models/index.js';
import { computeLebalmaPlan, generateSchedule, planFromProduct } from '../services/lebalma.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { LEBALMA_CONTRACT_STATUS } from '../utils/constants.js';

// GET /api/lebalma/simulate?productId=  → simulateur d'échéancier
export const simulate = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.query.productId);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });
  if (!product.lebalmaEligible || !product.lebalmaMonths) {
    return fail(res, { status: 400, message: 'Produit non éligible à Lebalma' });
  }

  const plan = computeLebalmaPlan(product.price, planFromProduct(product));
  const schedule = generateSchedule(plan);
  return success(res, { data: { plan, schedule } });
});

// POST /api/lebalma/subscribe  { productId }  → crée un contrat + échéancier
export const subscribe = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.body.productId);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });
  if (!product.lebalmaEligible || !product.lebalmaFrequency) {
    return fail(res, { status: 400, message: 'Produit non éligible à Lebalma' });
  }

  // KYC requis (décision : appareil remis dès l'acompte → vérification indispensable)
  if (!req.user.isKycVerified) {
    return fail(res, {
      status: 403,
      message: 'Vérification d’identité (KYC) requise avant de souscrire à Lebalma',
    });
  }

  const plan = computeLebalmaPlan(product.price, product.lebalmaFrequency);
  const schedule = generateSchedule(plan);

  const contract = await sequelize.transaction(async (t) => {
    const c = await LebalmaContract.create(
      {
        reference: `LEB-${Date.now().toString(36).toUpperCase()}`,
        userId: req.user.id,
        productId: product.id,
        frequency: plan.frequency,
        productPrice: plan.productPrice,
        downPaymentPercent: plan.downPaymentPercent,
        downPaymentAmount: plan.downPaymentAmount,
        financedAmount: plan.financedAmount,
        installmentsCount: plan.installmentsCount,
        installmentAmount: plan.installmentAmount,
        totalAmount: plan.totalAmount,
        status: LEBALMA_CONTRACT_STATUS.PENDING,
        startDate: new Date(),
      },
      { transaction: t }
    );

    for (const step of schedule) {
      await LebalmaInstallment.create(
        { contractId: c.id, sequence: step.sequence, dueDate: step.dueDate, amount: step.amount },
        { transaction: t }
      );
    }
    return c;
  });

  return created(res, {
    message: 'Contrat Lebalma créé. Réglez l’acompte pour l’activer.',
    data: contract,
  });
});

// GET /api/lebalma/contracts  → contrats de l'utilisateur
export const myContracts = asyncHandler(async (req, res) => {
  const contracts = await LebalmaContract.findAll({
    where: { userId: req.user.id },
    include: [
      { model: LebalmaInstallment, as: 'installments' },
      { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
    ],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: contracts });
});
