require('dotenv').config();

module.exports = {
  development: {
    host: process.env.DEV_DB_HOST,
    database:process.env.DEV_DB_DATABASE,
    user: process.env.DEV_DB_USER,
    port: process.env.DEV_DB_PORT,
    password: process.env.DEV_DB_PASSWORD,
    dialect: 'postgres',
  },
  production: {
    host: process.env.PROD_DB_HOST,
    database:process.env.PROD_DB_DATABASE,
    user: process.env.PROD_DB_USER,
    port: process.env.PROD_DB_PORT,
    password: process.env.PROD_DB_PASSWORD,
    dialect: 'postgres',
  }
};
