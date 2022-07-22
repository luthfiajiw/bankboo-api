const Sequelize = require('sequelize');
const config = require('./config');
require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const host = isProd ? config.production.host : config.development.host;
const database = isProd ? config.production.database : config.development.database;
const user = isProd ? config.production.username : config.development.username;
const password = isProd ? config.production.password : config.development.password;
const port = isProd ? config.production.port : config.development.port;

const connection = new Sequelize(
  database,
  user,
  password, {
  host: host,
  dialect: 'postgres',
  ...(process.env.NODE_ENV === 'production' && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
});

module.exports = connection;
