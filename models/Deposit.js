const Sequelize = require('sequelize');
const connection = require('../config/connection');

const GarbageCategory = require('./GarbageCategory');
const SavingBook = require('./SavingBook');

const Deposit = connection.define('deposit', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  status: {
    type: Sequelize.ENUM,
    values: ['pending', 'succeed', 'failed']
  },
  note: Sequelize.TEXT,
  weight: Sequelize.INTEGER,
  amount_per_kg: Sequelize.INTEGER,
}, {underscored: true, timestamps: true});

Deposit.belongsTo(GarbageCategory, {
  as: 'garbage_category',
  foreignKey: 'garbage_category_id',
  constraints: false,
});

Deposit.belongsTo(SavingBook, {
  as: 'saving_book',
  foreignKey: 'saving_book_id',
  constraints: false,
});

module.exports = Deposit;
