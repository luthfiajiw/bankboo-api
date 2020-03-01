const Sequelize = require('sequelize');
const connection = require('../config/connection');

const GarbageCategory = require('./GarbageCategory');
const User = require('./User');
const Bank = require('./Bank');
const PaymentMethod = require('./PaymentMethod');

const Transaction = connection.define('transaction', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  note: Sequelize.TEXT,
  weight: Sequelize.INTEGER,
  total_amount: Sequelize.INTEGER,
}, {underscored: true});

Transaction.belongsTo(User, {
  foreignKey: 'user_id'
});

Transaction.belongsTo(GarbageCategory, {
  foreignKey: 'garbage_category_id'
});

Transaction.belongsTo(PaymentMethod, {
  foreignKey: 'payment_method_id'
})

Transaction.belongsTo(Bank, {
  as: 'bank',
  foreignKey: 'bank_id'
});

Transaction.belongsTo(User, {
  as: 'customer',
  foreignKey: 'customer_id'
});

module.exports = Transaction;
