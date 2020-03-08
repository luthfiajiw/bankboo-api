const Sequelize = require('sequelize');
const connection = require('../config/connection');

const User = require('./User');
const Bank = require('./Bank');
const SavingBook = require('./SavingBook');

const BankCustomer = connection.define('bank_customers', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  registered_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    name: 'registered_at',
    field: 'registered_at'
  },
}, {underscored: true, timestamps: false});

BankCustomer.belongsTo(User, {
  foreignKey: 'customer_id',
  constraints: false,
});

BankCustomer.belongsTo(Bank, {
  foreignKey: 'bank_id',
  constraints: false,
});

BankCustomer.belongsTo(SavingBook, {
  foreignKey: 'saving_book_id',
  constraints: false,
});

module.exports = BankCustomer;
