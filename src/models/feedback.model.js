import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/** Avis sur la boutique (témoignage global, différent des avis produit). */
const Feedback = sequelize.define(
  'Feedback',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING }, // ville / statut (optionnel)
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, allowNull: false },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'feedbacks' }
);

export default Feedback;
