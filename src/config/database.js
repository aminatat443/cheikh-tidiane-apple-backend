import { Sequelize } from 'sequelize';

/**
 * Connexion Sequelize — PostgreSQL.
 *
 * Deux modes :
 *  1) Production/Render : fournir `DATABASE_URL` (chaîne postgres://…). SSL activé
 *     automatiquement (Render exige SSL).
 *  2) Local : variables DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD (Postgres local),
 *     SSL désactivé sauf si DB_SSL=true.
 */
const {
  DATABASE_URL,
  DB_NAME = 'cheikh_tidiane_apple',
  DB_USER = 'postgres',
  DB_PASSWORD = '',
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_SSL,
} = process.env;

const common = {
  dialect: 'postgres',
  logging: false,
  define: { timestamps: true, underscored: false },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
};

// SSL requis par Render (et la plupart des Postgres managés).
// `rejectUnauthorized: false` : accepte le certificat auto-signé de Render.
const useSsl = Boolean(DATABASE_URL) || DB_SSL === 'true';
if (useSsl) {
  common.dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
}

export const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, common)
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, { host: DB_HOST, port: Number(DB_PORT), ...common });

export default sequelize;
