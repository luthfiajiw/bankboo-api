const Sequelize = require('sequelize');
const connection = require('../config/connection');

const GarbageCategory = connection.define('garbage_categories', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  category: {
    type: Sequelize.ENUM,
    values: [
      'plastic',
      'paper',
      'cloth',
      'cans',
      'tires',
      'wood',
      'iron'
    ]
  },
  name: Sequelize.STRING,
}, {underscored: true, timestamps: false});

// GarbageCategory.bulkCreate([
//   {category: 'plastic', name: 'Botol'},
//   {category: 'paper', name: 'Kertas/Kardus'},
//   {category: 'cloth', name: 'Kain/Pakaian'},
//   {category: 'cans', name: 'Kaleng'},
//   {category: 'tires', name: 'Ban'},
//   {category: 'wood', name: 'Kayu'},
//   {category: 'iron', name: 'Besi'},
// ]);

module.exports = GarbageCategory;
