const Sequelize = require('sequelize');

const SavingBook = require('../models/SavingBook');
const Bank = require('../models/Bank');
const BankCustomer = require('../models/BankCustomer');
const User = require('../models/User');

const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

const Op = Sequelize.Op;

module.exports = function(app) {
  app.get(`${endpoint_ver}/saving-books`, checkAuth, (req, res, next) => {
    const { user_id } = req.userData;
    const { page, perPage } = pageQueryHelper(req.query);
    console.log(user_id);

    SavingBook.findAndCountAll({
      where: { customer_id: user_id },
      limit: perPage,
      offset: (page - 1) * 10,
      attributes: { exclude: ['customer_id', 'bank_id'] },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: {exclude: ['last_login', 'password', 'created_at', 'updated_at']}
        },
        {
          model: Bank,
          as: 'bank',
          attributes: {exclude: ['last_login', 'password', 'created_at', 'updated_at']}
        }
      ]
    })
    .then(savingBooks => {
      const totalPage = savingBooks.count === 0 ? 1 : Math.ceil(savingBooks.count/perPage);
      const pagination = paginationHelper(page, perPage);
      const datas = {
        ...savingBooks,
        ...pagination
      }
      responseHelper(res, datas);
    });
  });

  // Create Saving Book
  app.post(`${endpoint_ver}/saving-books`, checkAuth, (req, res, next) => {
    const { user_id } = req.userData;
    const { bank_id } = req.body;

    const newSavingBook = SavingBook.build({
      bank_id,
      customer_id: user_id
    });

    newSavingBook.save()
    .then(savingBook => {
      const newBankCustomer = BankCustomer.build({
        bank_id,
        customer_id: user_id,
        saving_book_id: savingBook.id
      })
      newBankCustomer.save();

      res.status(201).json({
        statusCode: 201,
        message: 'new saving book has been created',
        savingBookCreated: savingBook
      });
    })
    .catch(err => {
      res.status(400).json({
        error: {
          statusCode: 400,
          message: err
        }
      });
    })
  });
};
