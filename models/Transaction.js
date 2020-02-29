const Sequelize = require('sequelize');
const connection = require('../config/connection');

const GarbageCategory = require('./GarbageCategory');
const User = require('./User');

const Transaction = connection.define('transaction', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  weight: Sequelize.INTEGER,
  total_amount: Sequelize.INTEGER,
}, {underscored: true});

Transaction.belongsTo(GarbageCategory, {
  foreignKey: 'garbage_category_id'
});

Transaction.belongsTo(User, {
  foreignKey: 'user_id'
});

Transaction.belongsTo(User, {
  as: 'collector',
  foreignKey: 'collector_id'
});

Transaction.belongsTo(User, {
  as: 'customer',
  foreignKey: 'customer_id'
});

module.exports = Transaction;
