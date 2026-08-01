import { Op } from 'sequelize';
import {
  sequelize,
  User,
  Product,
  LebalmaContract,
  LebalmaInstallment,
} from '../models/index.js';
import { computeLebalmaPlan, generateSchedule, planFromProduct } from '../services/lebalma.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { LEBALMA_CONTRACT_STATUS, INSTALLMENT_STATUS } from '../utils/constants.js';
import { createNotification, notifyAllAdmins } from '../services/notification.service.js';

const CONTRACT_STATUS_LABELS = {
  pending: 'en attente',
  active: 'actif',
  completed: 'terminé',
  defaulted: 'en défaut',
  cancelled: 'annulé',
};

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

  await notifyAllAdmins({
    type: 'lebalma_new',
    title: 'Nouvelle souscription Lebalma',
    message: `Contrat ${contract.reference} — ${product.name}`,
    link: '/admin/lebalma',
  });
  await createNotification({
    userId: req.user.id,
    type: 'lebalma_new',
    title: 'Contrat Lebalma créé',
    message: `Votre contrat ${contract.reference} a été créé. Réglez l’acompte pour l’activer.`,
    link: '/orders',
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

// POST /api/lebalma/installments/:id/pay  { method }  → le client initie un paiement
export const clientInitiatePayment = asyncHandler(async (req, res) => {
  const installment = await LebalmaInstallment.findByPk(req.params.id, {
    include: [{ model: LebalmaContract, as: 'contract' }],
  });
  if (!installment) return fail(res, { status: 404, message: 'Échéance introuvable' });
  if (installment.contract?.userId !== req.user.id) {
    return fail(res, { status: 403, message: 'Accès refusé' });
  }
  if (installment.status === INSTALLMENT_STATUS.PAID) {
    return fail(res, { status: 400, message: 'Cette échéance est déjà réglée' });
  }

  const method = req.body.method || 'wave';
  const labels = {
    wave: 'Wave',
    orange_money: 'Orange Money',
    bank_transfer: 'Virement bancaire',
    cash: 'Espèces',
  };
  await installment.update({
    status: INSTALLMENT_STATUS.PENDING,
    paymentMethod: method,
    paymentInitiatedAt: new Date(),
  });

  await notifyAllAdmins({
    type: 'lebalma_payment_pending',
    title: 'Paiement d’échéance à valider',
    message: `${req.user.name} a initié le paiement de l’échéance n°${installment.sequence} (contrat ${installment.contract.reference}) par ${labels[method] || method}.`,
    link: '/admin/lebalma',
  });

  return success(res, {
    message: 'Paiement initié — en attente de validation par la boutique.',
    data: installment,
  });
});

/* =========================================================================
 *  ADMINISTRATION DES CONTRATS LEBALMA
 * ========================================================================= */

// POST /api/admin/lebalma/contracts  { userId, productId, price? }  → contrat en boutique
export const adminCreateContract = asyncHandler(async (req, res) => {
  const { userId, productId, price, kyc } = req.body;
  const client = await User.findByPk(userId);
  if (!client) return fail(res, { status: 404, message: 'Client introuvable' });
  const product = await Product.findByPk(productId);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });
  if (!product.lebalmaEligible || !product.lebalmaMonths) {
    return fail(res, { status: 400, message: 'Produit non éligible à Lebalma' });
  }

  // Pièce d'identité (KYC) : enregistre les photos + infos et valide le KYC.
  if (kyc && (kyc.frontUrl || kyc.backUrl || kyc.nin)) {
    const patch = {
      idCardFrontUrl: kyc.frontUrl || client.idCardFrontUrl,
      idCardBackUrl: kyc.backUrl || client.idCardBackUrl,
      idNin: kyc.nin || client.idNin,
      idBirthDate: kyc.birthDate || client.idBirthDate,
      idExpiryDate: kyc.expiryDate || client.idExpiryDate,
      isKycVerified: true,
    };
    const fullName = [kyc.firstName, kyc.lastName].filter(Boolean).join(' ').trim();
    if (fullName) patch.name = fullName;
    await client.update(patch);
  }

  const effectivePrice = Number(price) > 0 ? Number(price) : product.price;
  const plan = computeLebalmaPlan(effectivePrice, planFromProduct(product));
  const schedule = generateSchedule(plan);

  const contract = await sequelize.transaction(async (t) => {
    const c = await LebalmaContract.create(
      {
        reference: `LEB-${Date.now().toString(36).toUpperCase()}`,
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

  await createNotification({
    userId: client.id,
    type: 'lebalma_new',
    title: 'Nouveau financement Lebalma',
    message: `Un contrat Lebalma ${contract.reference} a été créé pour vous (${product.name}). Consultez votre espace pour le suivi.`,
    link: '/mes-financements',
  });

  return created(res, { message: 'Contrat créé pour le client', data: contract });
});

// GET /api/admin/lebalma/contracts  → tous les contrats
export const allContracts = asyncHandler(async (req, res) => {
  const contracts = await LebalmaContract.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
      { model: LebalmaInstallment, as: 'installments' },
    ],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: contracts });
});

// GET /api/admin/lebalma/contracts/:id  → détail d'un contrat
export const getContract = asyncHandler(async (req, res) => {
  const contract = await LebalmaContract.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
      { model: Product, as: 'product', attributes: ['id', 'name', 'images'] },
      { model: LebalmaInstallment, as: 'installments' },
    ],
    order: [[{ model: LebalmaInstallment, as: 'installments' }, 'sequence', 'ASC']],
  });
  if (!contract) return fail(res, { status: 404, message: 'Contrat introuvable' });
  return success(res, { data: contract });
});

// PUT /api/admin/lebalma/contracts/:id/status  { status }
export const updateContractStatus = asyncHandler(async (req, res) => {
  const contract = await LebalmaContract.findByPk(req.params.id);
  if (!contract) return fail(res, { status: 404, message: 'Contrat introuvable' });
  const { status } = req.body;
  if (!Object.values(LEBALMA_CONTRACT_STATUS).includes(status)) {
    return fail(res, { status: 400, message: 'Statut de contrat invalide' });
  }
  await contract.update({ status });
  await createNotification({
    userId: contract.userId,
    type: 'lebalma_status',
    title: 'Contrat Lebalma mis à jour',
    message: `Votre contrat ${contract.reference} est désormais « ${CONTRACT_STATUS_LABELS[status] || status} ».`,
    link: '/orders',
  });
  return success(res, { message: 'Statut du contrat mis à jour', data: contract });
});

// PUT /api/admin/lebalma/contracts/:id/deliver  → marque l'appareil comme remis
export const markDeviceDelivered = asyncHandler(async (req, res) => {
  const contract = await LebalmaContract.findByPk(req.params.id);
  if (!contract) return fail(res, { status: 404, message: 'Contrat introuvable' });
  await contract.update({
    deviceDeliveredAt: new Date(),
    status:
      contract.status === LEBALMA_CONTRACT_STATUS.PENDING
        ? LEBALMA_CONTRACT_STATUS.ACTIVE
        : contract.status,
  });
  await createNotification({
    userId: contract.userId,
    type: 'lebalma_delivered',
    title: 'Appareil remis',
    message: `Votre appareil (contrat ${contract.reference}) a été remis. Bon usage !`,
    link: '/orders',
  });
  return success(res, { message: 'Appareil marqué comme remis', data: contract });
});

// PUT /api/admin/lebalma/installments/:id/pay  → marque une échéance payée
export const markInstallmentPaid = asyncHandler(async (req, res) => {
  const installment = await LebalmaInstallment.findByPk(req.params.id);
  if (!installment) return fail(res, { status: 404, message: 'Échéance introuvable' });

  await installment.update({ status: INSTALLMENT_STATUS.PAID, paidAt: new Date() });

  // Si toutes les échéances sont payées → contrat terminé, sinon actif.
  const remaining = await LebalmaInstallment.count({
    where: { contractId: installment.contractId, status: { [Op.ne]: INSTALLMENT_STATUS.PAID } },
  });
  const contract = await LebalmaContract.findByPk(installment.contractId);
  if (contract) {
    await contract.update({
      status: remaining === 0 ? LEBALMA_CONTRACT_STATUS.COMPLETED : LEBALMA_CONTRACT_STATUS.ACTIVE,
    });
    await createNotification({
      userId: contract.userId,
      type: 'lebalma_installment',
      title: remaining === 0 ? 'Contrat Lebalma soldé' : 'Échéance réglée',
      message:
        remaining === 0
          ? `Félicitations ! Votre contrat ${contract.reference} est entièrement réglé.`
          : `Échéance n°${installment.sequence} du contrat ${contract.reference} enregistrée comme payée.`,
      link: '/orders',
    });
  }

  return success(res, {
    message: 'Échéance marquée comme payée',
    data: { installment, contractStatus: contract?.status },
  });
});
