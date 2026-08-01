import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Inscription « Prévenez-moi » : un client demande à être averti quand un
 * produit en rupture revient en stock. `notifiedAt` renseigné = alerte envoyée.
 */
const StockAlert = sequelize.define(
  'StockAlert',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    notifiedAt: { type: DataTypes.DATE },
  },
  {
    tableName: 'stock_alerts',
    indexes: [{ unique: true, fields: ['userId', 'productId'] }],
  }
);

export default StockAlert;
