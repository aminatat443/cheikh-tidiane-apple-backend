import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Review = sequelize.define(
  'Review',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'reviews',
    indexes: [{ unique: true, fields: ['userId', 'productId'] }],
  }
);

export default Review;
