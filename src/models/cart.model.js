import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Cart = sequelize.define(
  'Cart',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    // Dernière relance « panier abandonné » envoyée (anti-spam).
    reminderSentAt: { type: DataTypes.DATE },
  },
  { tableName: 'carts' }
);

export const CartItem = sequelize.define(
  'CartItem',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    color: { type: DataTypes.STRING },
    storage: { type: DataTypes.STRING },
  },
  { tableName: 'cart_items' }
);
