import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../utils/constants.js';

export const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      defaultValue: ORDER_STATUS.PENDING,
    },
    // Montants en FCFA (XOF)
    subtotal: { type: DataTypes.INTEGER, defaultValue: 0 },
    shippingFee: { type: DataTypes.INTEGER, defaultValue: 0 },
    total: { type: DataTypes.INTEGER, defaultValue: 0 },
    paymentMethod: { type: DataTypes.ENUM(...Object.values(PAYMENT_METHODS)) },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    isLebalma: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Livraison
    shippingName: { type: DataTypes.STRING },
    shippingPhone: { type: DataTypes.STRING },
    shippingAddress: { type: DataTypes.STRING },
    shippingCity: { type: DataTypes.STRING },
  },
  { tableName: 'orders' }
);

export const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER },
    // Copie figée au moment de la commande
    productName: { type: DataTypes.STRING },
    unitPrice: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    color: { type: DataTypes.STRING },
    storage: { type: DataTypes.STRING },
  },
  { tableName: 'order_items' }
);
