const Sequelize = require('sequelize');
const connection = require('../config/connection');

const PaymentMethod = connection.define('payment_methods', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  code: Sequelize.STRING,
  name: Sequelize.STRING,
}, {underscored: true});

PaymentMethod.bulkCreate([
  {code: 'T-001', name: 'Tunai'}
])

module.exports = PaymentMethod;;
