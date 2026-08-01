import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Réglages applicatifs (clé/valeur JSON). Utilisé notamment pour les
 * informations de facturation de la boutique (coordonnées, cachet + signature).
 * La valeur est stockée en TEXT et (dé)sérialisée en JSON par les getters/setters.
 */
const Setting = sequelize.define(
  'Setting',
  {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: {
      type: DataTypes.TEXT('long'),
      defaultValue: '{}',
      get() {
        const v = this.getDataValue('value');
        if (v == null) return {};
        try {
          return typeof v === 'string' ? JSON.parse(v) : v;
        } catch {
          return {};
        }
      },
      set(val) {
        this.setDataValue('value', typeof val === 'string' ? val : JSON.stringify(val ?? {}));
      },
    },
  },
  { tableName: 'settings' }
);

export default Setting;
