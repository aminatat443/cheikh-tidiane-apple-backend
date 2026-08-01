import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import {
  LEBALMA_FREQUENCY,
  LEBALMA_CONTRACT_STATUS,
  INSTALLMENT_STATUS,
} from '../utils/constants.js';

/**
 * Contrat de financement Lebalma.
 * Règles : fréquence hebdomadaire (>= iPhone 11 Pro) ou mensuelle (>= iPhone 12 Pro).
 * Acompte = pourcentage du prix ; l'appareil est remis dès l'acompte payé.
 */
export const LebalmaContract = sequelize.define(
  'LebalmaContract',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    orderId: { type: DataTypes.INTEGER },
    frequency: {
      type: DataTypes.ENUM(...Object.values(LEBALMA_FREQUENCY)),
      allowNull: false,
    },
    // Montants en FCFA (XOF)
    productPrice: { type: DataTypes.INTEGER, allowNull: false },
    downPaymentPercent: { type: DataTypes.FLOAT, allowNull: false },
    downPaymentAmount: { type: DataTypes.INTEGER, allowNull: false },
    financedAmount: { type: DataTypes.INTEGER, allowNull: false }, // reste à financer
    installmentsCount: { type: DataTypes.INTEGER, allowNull: false },
    installmentAmount: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.INTEGER, allowNull: false }, // coût total
    status: {
      type: DataTypes.ENUM(...Object.values(LEBALMA_CONTRACT_STATUS)),
      defaultValue: LEBALMA_CONTRACT_STATUS.PENDING,
    },
    startDate: { type: DataTypes.DATEONLY },
    deviceDeliveredAt: { type: DataTypes.DATE },
  },
  { tableName: 'lebalma_contracts' }
);

export const LebalmaInstallment = sequelize.define(
  'LebalmaInstallment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    contractId: { type: DataTypes.INTEGER, allowNull: false },
    sequence: { type: DataTypes.INTEGER, allowNull: false }, // n° d'échéance
    dueDate: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(INSTALLMENT_STATUS)),
      defaultValue: INSTALLMENT_STATUS.UPCOMING,
    },
    // Méthode choisie par le client lors de l'initiation du paiement
    paymentMethod: { type: DataTypes.STRING },
    paymentInitiatedAt: { type: DataTypes.DATE },
    paidAt: { type: DataTypes.DATE },
  },
  { tableName: 'lebalma_installments' }
);
