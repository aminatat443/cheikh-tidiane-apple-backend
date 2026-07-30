import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { ROLES } from '../utils/constants.js';

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      defaultValue: ROLES.CLIENT,
    },
    address: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    // KYC (Lebalma)
    isKycVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    idDocumentUrl: { type: DataTypes.STRING },
  },
  {
    tableName: 'users',
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: { attributes: {} } },
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default User;
