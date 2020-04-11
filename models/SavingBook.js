const Sequelize = require('sequelize');
const connection = require('../config/connection');

const Bank = require('./Bank');
const BankCustomer = require('./BankCustomer');

const SavingBook = connection.define('saving_books', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  number: {
    type: Sequelize.INTEGER,
    defaultValue: Math.floor(100000 + Math.random() * 900000)
  },
  balance:{
    type:  Sequelize.BIGINT,
    defaultValue: 0
  },
}, {underscored: true, timestamps: true});

SavingBook.belongsTo(BankCustomer, {
  as: 'bank_customer',
  foreignKey: 'bank_customer_id',
  constraints: false,
});

SavingBook.belongsTo(Bank, {
  as: 'bank',
  foreignKey: 'bank_id',
  constraints: false,
});

module.exports = SavingBook;
