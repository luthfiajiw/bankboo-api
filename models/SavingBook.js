const Sequelize = require('sequelize');
const connection = require('../config/connection');

const Bank = require('./Bank');
const User = require('./User');

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
    type:  Sequelize.INTEGER,
    defaultValue: 0
  },
}, {underscored: true, timestamps: true});

SavingBook.belongsTo(User, {
  as: 'customer',
  foreignKey: 'user_id',
  constraints: false,
});

SavingBook.belongsTo(Bank, {
  as: 'bank',
  foreignKey: 'bank_id',
  constraints: false,
});

module.exports = SavingBook;
