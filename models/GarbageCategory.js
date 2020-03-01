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
      'bottles',
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

GarbageCategory.bulkCreate([
  {category: 'bottles', name: 'Botol Bekas'},
  {category: 'paper', name: 'Kertas/Koran Bekas'},
  {category: 'cloth', name: 'Kain/Pakaian Bekas'},
  {category: 'cans', name: 'Kaleng Bekas'},
  {category: 'tires', name: 'Ban Bekas'},
  {category: 'wood', name: 'Kayu Bekas'},
  {category: 'iron', name: 'Besi Bekas'},
]);

module.exports = GarbageCategory;
