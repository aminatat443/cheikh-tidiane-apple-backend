import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../utils/constants.js';

const Payment = sequelize.define(
  'Payment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER },
    // Rattachement possible à une échéance Lebalma
    installmentId: { type: DataTypes.INTEGER },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    method: { type: DataTypes.ENUM(...Object.values(PAYMENT_METHODS)), allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false }, // FCFA
    status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    // 'order' ou 'installment' (échéance Lebalma)
    purpose: { type: DataTypes.STRING, defaultValue: 'order' },
    // 'wave' | 'orange_money' | 'card' | 'simulation'
    provider: { type: DataTypes.STRING },
    // Clé d'idempotence (une tentative = une clé) — évite les double-crédits.
    idempotencyKey: { type: DataTypes.STRING, unique: true },
    // Référence / id de session renvoyé par la passerelle (Wave / OM / carte)
    providerRef: { type: DataTypes.STRING },
    rawResponse: { type: DataTypes.JSON },
  },
  { tableName: 'payments' }
);

export default Payment;
