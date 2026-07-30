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
    // Référence renvoyée par la passerelle (Wave / OM / carte)
    providerRef: { type: DataTypes.STRING },
    rawResponse: { type: DataTypes.JSON },
  },
  { tableName: 'payments' }
);

export default Payment;
