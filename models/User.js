const Sequelize = require('sequelize');
const connection = require('../config/connection');

const User = connection.define('user', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
    trim: true,
    validate: {
      notNull: {
        message: 'first name is required'
      }
    }
  },
  last_name: {
    type: Sequelize.STRING,
    trim: true,
  },
  fullname: Sequelize.STRING,
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
  image_url: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        message: 'this link isn\'t a valid url'
      }
    }
  },
  mobile_phone: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  address: Sequelize.TEXT,
  last_login: Sequelize.DATE,
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

module.exports = User;
