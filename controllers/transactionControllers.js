const Sequelize = require('sequelize');

const Transaction = require('../models/Transaction');
const SavingBook = require('../models/SavingBook');
const User = require('../models/User');
const GarbageCategory = require('../models/GarbageCategory');

const connection = require('../config/connection');
const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  app.get(`${endpoint_ver}/transactions`, checkAuth, (req, res, next) => {
    const { user_id } = req.userData;
    const { page, perPage } = pageQueryHelper(req.query);

    Transaction.findAndCountAll({
      where: { user_id },
      limit: perPage,
      offset: (page - 1) * 10,
      attributes: { exclude: ['garbage_category_id', 'saving_book_id', 'user_id'] },
      include: [{
        model: GarbageCategory,
        as: 'garbage_category',
      }]
    })
    .then(garbageCategories => {
      const totalPage = garbageCategories.count === 0 ? 1 : Math.ceil(garbageCategories.count/perPage);
      const pagination = paginationHelper(page, perPage);
      const datas = {
        ...garbageCategories,
        ...pagination
      }
      responseHelper(res, datas);
    })
  });

  // Create Transaction
  app.post(`${endpoint_ver}/transactions`, checkAuth, (req, res, next) => {
    const { user_id } = req.userData;
    const {
      saving_book_id, garbage_category_id, note, weight, total_amount
    } = req.body;

    const newTransaction = Transaction.build({
      saving_book_id,
      garbage_category_id,
      user_id,
      note,
      weight,
      total_amount
    });

    newTransaction.save()
    .then(transaction => {
      connection.query(`UPDATE saving_books SET balance = balance + ${total_amount} WHERE id = '${saving_book_id}'`, { raw: true });
      res.status(201).json({
        status_code: 201,
        message: 'new transaction has been created',
        result: transaction
      })
    })
    .catch(err => {
      res.status(400).json(errorResponseHelper(400, err));
    });
  });

  // Detail Transaction
  app.get(`${endpoint_ver}/transactions/:transactionId`, checkAuth, (req, res, next) => {
    const { transactionId } = req.params;

    Transaction.findOne({
      where: { id: transactionId },
      attributes: { exclude: ['garbage_category_id', 'saving_book_id', 'user_id'] },
      include: [{
        model: GarbageCategory,
        as: 'garbage_category',
      }]
    })
    .then(transaction => {
      if (transaction === null) {
        res.status(404).json(errorResponseHelper(404, 'transaction not found'));
      }

      res.status(200).json({
        status_code: 200,
        message: 'successful',
        result: transaction
      });
    })
    .catch(err => {
      res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
    });
  })

  // Delete Transaction
  app.delete(`${endpoint_ver}/transactions/:transactionId`, checkAuth, (req, res, next) => {
    const { transactionId } = req.params;

    Transaction.destroy({ where: {id: transactionId} })
    .then(() => {
      res.status(200).json({
        status_code: 200,
        message: 'transaction deleted'
      });
    })
    .catch(() => {
      res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
    })
  })
};
