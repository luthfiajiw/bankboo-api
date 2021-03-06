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
  status: {
    type: Sequelize.ENUM,
    values: ['waiting_approval', 'approved']
  },
  registered_at: {
    type: Sequelize.DATE,
    name: 'registered_at',
    field: 'registered_at'
  },
}, {underscored: true, timestamps: false});

BankCustomer.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
  constraints: false,
});

BankCustomer.belongsTo(Bank, {
  as: 'bank',
  foreignKey: 'bank_id',
  constraints: false,
});

BankCustomer.belongsTo(SavingBook, {
  as: 'saving_book',
  foreignKey: 'saving_book_id',
  constraints: false,
});

module.exports = BankCustomer;
