const Sequelize = require('sequelize');
const connection = require('../config/connection');

const User = require('./User');
const Bank = require('./Bank');

const number = Math.floor(1000000 + Math.random() * 9000000);

const SavingBook = connection.define('saving_books', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  number: {
    type: Sequelize.INTEGER,
    defaultValue: number
  },
  balance: Sequelize.BIGINT,
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    name: 'created_at',
    field: 'created_at'
  },
  updated_at: {
      type: Sequelize.DATE,
      name: 'updated_at',
      field: 'updated_at'
  }
}, {underscored: true, timestamps: false});

SavingBook.belongsTo(User, {
  foreignKey: 'customer_id'
});

SavingBook.belongsTo(Bank, {
  foreignKey: 'bank_id'
});

module.exports = SavingBook;
