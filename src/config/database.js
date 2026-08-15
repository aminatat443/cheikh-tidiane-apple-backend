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
  pool: { max: 10, min: 0, acquire: 60000, idle: 10000 },
  // Réessaie automatiquement les erreurs de connexion transitoires (ETIMEDOUT,
  // connexion réinitialisée…), fréquentes sur une base distante Render.
  retry: {
    max: 3,
    match: [/ETIMEDOUT/, /ECONNRESET/, /ECONNREFUSED/, /EHOSTUNREACH/, /ENETUNREACH/, /SequelizeConnectionError/],
  },
};

// Tolérance : on accepte une URL de connexion `postgres://…` fournie via
// DATABASE_URL OU collée par erreur dans DB_HOST (piège fréquent). Dans les deux
// cas on l'utilise comme chaîne de connexion complète.
const isUrl = (v) => /^postgres(ql)?:\/\//i.test(v || '');
const connectionUrl = isUrl(DATABASE_URL) ? DATABASE_URL : isUrl(DB_HOST) ? DB_HOST : null;

// keepAlive : garde la connexion TCP vivante (évite les coupures sur base distante).
// connectionTimeoutMillis : échoue vite (15 s) au lieu d'attendre ~24 s.
common.dialectOptions = { keepAlive: true, connectionTimeoutMillis: 15000 };

// SSL requis par Render (et la plupart des Postgres managés).
// `rejectUnauthorized: false` : accepte le certificat auto-signé de Render.
const useSsl = Boolean(connectionUrl) || DB_SSL === 'true';
if (useSsl) {
  common.dialectOptions.ssl = { require: true, rejectUnauthorized: false };
}

export const sequelize = connectionUrl
  ? new Sequelize(connectionUrl, common)
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, { host: DB_HOST, port: Number(DB_PORT), ...common });

export default sequelize;
