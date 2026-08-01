import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { RETURN_STATUS } from '../utils/constants.js';

/**
 * Demande de retour d'articles d'une commande.
 * Le client sélectionne les articles + un motif ; la boutique approuve/refuse
 * puis suit le remboursement. Montant remboursé calculé côté serveur.
 */
export const ReturnRequest = sequelize.define(
  'ReturnRequest',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reference: { type: DataTypes.STRING, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(RETURN_STATUS)),
      defaultValue: RETURN_STATUS.REQUESTED,
    },
    // Montant remboursable (FCFA, entier) — somme des articles retournés
    refundAmount: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Note interne de la boutique (motif de refus, suivi du remboursement…)
    adminNote: { type: DataTypes.TEXT },
    resolvedAt: { type: DataTypes.DATE },
  },
  { tableName: 'return_requests' }
);

export const ReturnItem = sequelize.define(
  'ReturnItem',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    returnRequestId: { type: DataTypes.INTEGER, allowNull: false },
    orderItemId: { type: DataTypes.INTEGER },
    // Copie figée au moment de la demande
    productName: { type: DataTypes.STRING },
    unitPrice: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    color: { type: DataTypes.STRING },
    storage: { type: DataTypes.STRING },
  },
  { tableName: 'return_items' }
);
