import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { LEBALMA_FREQUENCY } from '../utils/constants.js';

/**
 * Champ JSON robuste MySQL/MariaDB : MariaDB stocke le JSON en LONGTEXT et
 * Sequelize renvoie une chaîne — ce getter la reparse en objet/tableau.
 */
function jsonField(name, defaultValue) {
  return {
    type: DataTypes.JSON,
    defaultValue,
    get() {
      const v = this.getDataValue(name);
      if (typeof v === 'string') {
        try {
          return JSON.parse(v);
        } catch {
          return defaultValue;
        }
      }
      return v ?? defaultValue;
    },
  };
}

const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    // Ex : "iPhone 15 Pro", "iPad Air", "MacBook Pro 14"
    model: { type: DataTypes.STRING },
    // Prix en FCFA (XOF), entier
    price: { type: DataTypes.INTEGER, allowNull: false },
    oldPrice: { type: DataTypes.INTEGER }, // prix barré si promo
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    // État du produit renseigné par l'admin : 'neuf' ou 'reconditionne'.
    condition: { type: DataTypes.STRING, defaultValue: 'reconditionne' },
    // Variantes stockées en JSON (compatibles MySQL & MariaDB)
    colors: jsonField('colors', []), // ex: [{name:"Noir",hex:"#111827"}]
    storages: jsonField('storages', []), // ex: ["128Go","256Go"]
    variants: jsonField('variants', []), // ex: [{storage:"128 Go", price:150000}]
    images: jsonField('images', []), // urls Cloudinary
    specs: jsonField('specs', {}), // caractéristiques techniques
    // Version « Neuf » proposée (sinon : reconditionné comme neuf uniquement)
    newAvailable: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Flags marketing
    isPromo: { type: DataTypes.BOOLEAN, defaultValue: false },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    isTopSale: { type: DataTypes.BOOLEAN, defaultValue: false },
    isNew: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Statistiques
    soldCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    ratingAvg: { type: DataTypes.FLOAT, defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Financement Lebalma (paramètres propres au produit)
    lebalmaEligible: { type: DataTypes.BOOLEAN, defaultValue: false },
    lebalmaFrequency: {
      type: DataTypes.ENUM(...Object.values(LEBALMA_FREQUENCY)),
      allowNull: true,
      defaultValue: LEBALMA_FREQUENCY.MONTHLY,
    },
    lebalmaDownPercent: { type: DataTypes.FLOAT, defaultValue: 0 }, // ex: 40 ou 60
    lebalmaMonths: { type: DataTypes.INTEGER, defaultValue: 0 }, // ex: 3 ou 6
    lebalmaMultiplier: { type: DataTypes.FLOAT, defaultValue: 1 }, // ex: 1.6 ou 1.7
  },
  { tableName: 'products' }
);

export default Product;
