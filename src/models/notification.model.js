import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Notification persistée (une ligne par destinataire).
 * Émise en temps réel via Socket.IO (`notification:new`) et consultable via l'API.
 */
const Notification = sequelize.define(
  'Notification',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    // Type logique : order_new, order_status, lebalma_new, lebalma_installment, lebalma_delivered, lebalma_status…
    type: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    // Lien front vers la ressource concernée (ex: /orders, /admin/orders)
    link: { type: DataTypes.STRING },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'notifications' }
);

export default Notification;
