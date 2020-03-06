const Sequelize = require('sequelize');
const connection = require('../config/connection');

const code = Math.floor(100000 + Math.random() * 900000);

const Bank = connection.define('bank', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
  },
  code: {
    type: Sequelize.INTEGER,
    defaultValue: code,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    trim: true,
    validate: {
      notNull: {
        message: 'name is required'
      }
    }
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
  image_url: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        message: 'this link isn\'t a valid url'
      }
    }
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notNull: {
        message: 'phone is required'
      }
    }
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

module.exports = Bank;
