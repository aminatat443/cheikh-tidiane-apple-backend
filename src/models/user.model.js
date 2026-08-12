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
    deliveryZone: { type: DataTypes.STRING }, // clé de zone de livraison mémorisée
    avatar: { type: DataTypes.STRING },
    // KYC (Lebalma)
    isKycVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    idDocumentUrl: { type: DataTypes.STRING },
    // Pièce d'identité : photos recto/verso + infos extraites (OCR)
    idCardFrontUrl: { type: DataTypes.STRING },
    idCardBackUrl: { type: DataTypes.STRING },
    idNin: { type: DataTypes.STRING },
    idBirthDate: { type: DataTypes.STRING },
    idExpiryDate: { type: DataTypes.STRING },
    // Double authentification (TOTP / Google Authenticator)
    twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    twoFactorSecret: { type: DataTypes.STRING }, // secret base32 — jamais exposé au client
    // Vérification d'email (à l'inscription)
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerifyToken: { type: DataTypes.STRING }, // hash SHA-256 du jeton — jamais exposé
    emailVerifyExpires: { type: DataTypes.DATE },
    // Réinitialisation de mot de passe (« mot de passe oublié »)
    passwordResetToken: { type: DataTypes.STRING }, // hash SHA-256 du jeton — jamais exposé
    passwordResetExpires: { type: DataTypes.DATE },
  },
  {
    tableName: 'users',
    // On n'expose jamais le mot de passe, le secret 2FA ni les jetons par défaut.
    defaultScope: {
      attributes: {
        exclude: [
          'password',
          'twoFactorSecret',
          'emailVerifyToken',
          'emailVerifyExpires',
          'passwordResetToken',
          'passwordResetExpires',
        ],
      },
    },
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
