const Sequelize = require('sequelize');
const connection = require('../config/connection');

const PaymentMethod = connection.define('payment_methods', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  code: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {underscored: true, timestamps: false});

// PaymentMethod.bulkCreate([
//   {code: 'T-001', name: 'Tunai'}
// ])

module.exports = PaymentMethod;;
