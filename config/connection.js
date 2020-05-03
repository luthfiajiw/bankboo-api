const Sequelize = require('sequelize');
const config = require('./config.js');
require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

const host = isProd ? config.prod.host : config.dev.host;
const database = isProd ? config.prod.database : config.dev.database;
const user = isProd ? config.prod.user : config.dev.user;
const password = isProd ? config.prod.password : config.dev.password;
const port = isProd ? config.prod.port : config.dev.port;

const connection = new Sequelize(
  database,
  user,
  password, {
  host: host,
  dialect: 'postgres'
});

module.exports = connection;
