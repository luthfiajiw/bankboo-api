const Sequelize = require('sequelize');

const Withdrawal = require('../models/Withdrawal');
const SavingBook = require('../models/SavingBook');
const PaymentMethod = require('../models/PaymentMethod');

const connection = require('../config/connection');
const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  app.get(`${endpoint_ver}/withdrawals/saving_book=:savingBookId`, checkAuth, (req, res, next) => {
    const { savingBookId } = req.params;
    const { page, perPage } = pageQueryHelper(req.query);

    Withdrawal.findAndCountAll({
      where: { saving_book_id: savingBookId },
      limit: perPage,
      offset: (page - 1) * 10,
      attributes: { exclude: ['saving_book_id', 'payment_method_id'] },
      include: [{
        model: PaymentMethod,
        as: 'payment_method'
      }]
    })
    .then(withdrawals => {
      const totalPage = withdrawals.count === 0 ? 1 : Math.ceil(withdrawals.count/perPage);
      const pagination = paginationHelper(page, perPage);
      const datas = {
        ...withdrawals,
        ...pagination
      };
      responseHelper(res, datas);
    })
    .catch(err => {
      res.status(400).json(errorResponseHelper(400, err));
    });
  });

  // Create Withdrawal
  app.post(`${endpoint_ver}/withdrawals`, checkAuth, (req, res, next) => {
    const { saving_book_id, payment_method_id, total_amount } = req.body;

    SavingBook.findByPk(saving_book_id)
    .then(savingBook => {
      if (savingBook.balance === 0) {
        return res.status(400).json(errorResponseHelper(400, "cannot perform withdraw action, the balance of this saving book is empty"));
      } else {
        const newWithdrawal = Withdrawal.build({
          saving_book_id,
          payment_method_id,
          total_amount,
        });

        newWithdrawal.save()
        .then(withdrawal => {
          connection.query(`UPDATE saving_books SET balance = balance - ${total_amount} WHERE id = '${saving_book_id}'`, { raw: true });

          res.status(201).json({
            status_code: 201,
            message: 'wtihdrawal successful',
            result: withdrawal
          })
        })
        .catch(err => {
          res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
        })
      }
    })
  })
};
