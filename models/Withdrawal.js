const Sequelize = require('sequelize');
const connection = require('../config/connection');

const SavingBook = require('./SavingBook');
const PaymentMethod = require('./PaymentMethod');

const Withdrawal = connection.define('withdrawal', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  total_amount: Sequelize.INTEGER
}, {underscored: true, timestamps: true});

Withdrawal.belongsTo(SavingBook, {
  as: 'saving_book',
  foreignKey: 'saving_book_id',
  constraints: false,
});

Withdrawal.belongsTo(PaymentMethod, {
  as: 'payment_method',
  foreignKey: 'payment_method_id',
  constraints: false
})
