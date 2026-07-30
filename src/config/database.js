import { Sequelize } from 'sequelize';

const {
  DB_NAME = 'cheikh_tidiane_apple',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_HOST = 'localhost',
  DB_PORT = 3306,
  NODE_ENV,
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: NODE_ENV === 'development' ? false : false,
  define: {
    timestamps: true,
    underscored: false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
