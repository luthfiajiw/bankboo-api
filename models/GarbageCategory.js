const Sequelize = require('sequelize');
const connection = require('../config/connection');connection

const GarbageCategory = connection.define('garbage_categories', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  category: {
    type: Sequelize.ENUM,
    values: [
      'used_bottles',
      'used_paper',
      'used_cloth',
      'used_cans',
      'used_tires',
      'used_wood',
      'used_iron'
    ]
  },
  name: Sequelize.STRING,
}, {underscored: true});

GarbageCategory.bulkCreate([
  {category: 'used_bottles', name: 'Botol Bekas'},
  {category: 'used_paper', name: 'Kertas/Koran Bekas'},
  {category: 'used_cloth', name: 'Kain/Pakaian Bekas'},
  {category: 'used_cans', name: 'Kaleng Bekas'},
  {category: 'used_tires', name: 'Ban Bekas'},
  {category: 'used_wood', name: 'Kayu Bekas'},
  {category: 'used_iron', name: 'Besi Bekas'},
]);

module.exports = GarbageCategory;
