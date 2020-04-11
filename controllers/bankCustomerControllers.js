const Sequelize = require('sequelize');

const BankCustomer = require('../models/BankCustomer');
const Bank = require('../models/Bank');
const User = require('../models/User');
const SavingBook = require('../models/SavingBook');

const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');
let moment = require('moment');

module.exports = function(app) {
  app.get(`${endpoint_ver}/bank-customers`, checkAuth, (req, res, next) => {
    const { bank_id } = req.userData;
    const { page, perPage } = pageQueryHelper(req.query);

    BankCustomer.findAndCountAll({
      where: { bank_id },
      limit: perPage,
      offset: (page - 1) * 10,
      attributes: { exclude: ['user_id', 'bank_id', 'saving_book_id'] },
      include: [
        {
          model: User,
          as: 'user',
          attributes: {exclude: ['last_login', 'password', 'created_at', 'updated_at']}
        },
        {
          model: Bank,
          as: 'bank',
          attributes: {exclude: ['last_login', 'password', 'created_at', 'updated_at']}
        },
        {
          model: SavingBook,
          as: 'saving_book',
          attributes: {exclude: ['user_id', 'bank_id', 'updated_at']}
        },
      ]
    })
    .then(bankCustomers => {
      const totalPage = bankCustomers.count === 0 ? 1 : Math.ceil(bankCustomers.count/perPage);
      const pagination = paginationHelper(page, perPage);
      const datas = {
        ...bankCustomers,
        ...pagination
      }
      responseHelper(res, datas);
    })
  });

  // User request to be a customer
  app.post(`${endpoint_ver}/bank-customers`, checkAuth, (req, res, next) => {
    const { user_id } = req.userData;
    const { bank_id } = req.body;

    const newBankCustomer = BankCustomer.build({
      status: "waiting_approval",
      user_id,
      bank_id,
    });

    newBankCustomer.save()
    .then(bankCustomer => {
      res.status(201).json({
        status_code: 201,
        message: 'new customer has been requested',
        result: bankCustomer
      })
    })
    .catch(err => {
      res.status(400).json(errorResponseHelper(400, err));
    })
  });

  // Bank accept customer request, change the status and create saving book for customer
  app.patch(`${endpoint_ver}/bank-customers/:bankCustomerId`, checkAuth, (req, res, next) => {
    const { bank_id } = req.userData;
    const { user_id } = req.body;
    const { bankCustomerId } = req.params;

    if (bank_id === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'only banks can accept customer requests'));
    } else {
      // Create saving book for customer
      const newSavingBook = SavingBook.build({
        bank_id,
        user_id
      });
      newSavingBook.save()
      .then(savingBook => {
        const updatedBankCustomer = {
          status: "approved",
          saving_book_id: savingBook.id,
          registered_at: moment().format('YYYY-MM-DD kk:mm:ss')
        }

        BankCustomer.update(updatedBankCustomer, { where: {id: bankCustomerId} })
        .then(() => {
          BankCustomer.findOne({
            where: { id: bankCustomerId },
            attributes: { exclude: ['bank_id', 'saving_book_id'] },
            include: [{
              model: User,
              as: 'user',
              attributes: {exclude: ['last_login', 'password', 'created_at', 'updated_at']}
            },]
          })
          .then(bankCustomer => {
            res.status(200).json({
              status_code: 200,
              message: 'customer request has been accepted',
              result: bankCustomer
            })
          })
          .catch(err => {
            res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
          });
        });

      })
    }
  });

  // Delete customer
  app.delete(`${endpoint_ver}/bank-customers/:bankCustomerId`, checkAuth, (req, res, next) => {
    const { bank_id } = req.userData;
    const { bankCustomerId } = req.params;

    if (bank_id === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'only banks can delete customer'));
    } else {
      BankCustomer.findByPk(bankCustomerId)
      .then(bankCustomer => {
        if (bankCustomer === null) {
          return res.status(404).json(errorResponseHelper(404, 'customer not found'));
        }

        BankCustomer.destroy({ where: {id: bankCustomerId} })
        .then(() => {
          res.status(200).json({
            status_code: 200,
            message: 'customer deleted'
          });
        })
        .catch(() => {
          res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
        })
      });
    }
  })
};
