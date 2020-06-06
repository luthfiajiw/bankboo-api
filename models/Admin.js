const Sequelize = require('sequelize');
const connection = require('../config/connection');

const Admin = connection.define('admin', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  fullname: {
    type: Sequelize.STRING,
    allowNull: false,
    trim: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    trim: true,
    validate: {
      notNull: {
        message: 'email is required'
      },
      isEmail: {
        message: 'this email isn\'t a valid email address'
      }
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    trim: true,
    validate: {
      notNull: {
        message: 'password is required'
      }
    }
  },
  is_super_admin: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  is_accessing_garbage_categories: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  is_accessing_payment_methods: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
}, {underscored: true, timestamps: true});

module.exports = Admin;
