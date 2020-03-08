const Sequelize = require('sequelize');
const connection = require('../config/connection');

const GarbageCategory = require('./GarbageCategory');
const User = require('./User');
const SavingBook = require('./SavingBook');

const Transaction = connection.define('transaction', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  note: Sequelize.TEXT,
  weight: Sequelize.INTEGER,
  total_amount: Sequelize.INTEGER,
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

Transaction.belongsTo(User, {
  foreignKey: 'user_id',
  constraints: false,
});

Transaction.belongsTo(GarbageCategory, {
  as: 'garbage_category',
  foreignKey: 'garbage_category_id',
  constraints: false,
});

Transaction.belongsTo(SavingBook, {
  foreignKey: 'saving_book_id',
  constraints: false,
});

module.exports = Transaction;
