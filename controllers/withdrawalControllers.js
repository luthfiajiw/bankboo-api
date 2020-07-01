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
        return res.status(403).json(errorResponseHelper(403, "cannot perform withdraw action, the balance of this saving book is 0"));
      } else {
        const newWithdrawal = Withdrawal.build({
          status: 'pending',
          saving_book_id,
          payment_method_id,
          total_amount,
        });

        newWithdrawal.save()
        .then(withdrawal => {
          res.status(201).json({
            status_code: 201,
            message: 'new withdrawal has been requested',
            result: withdrawal
          })
        })
        .catch(err => {
          res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
        })
      }
    })
  });

  // Bank change withdrawal status to succeed/failed
  app.patch(`${endpoint_ver}/withdrawals/:withdrawalId`, checkAuth, (req, res, next) => {
    const { bank_id } = req.userData;
    const { status } = req.body;
    const { withdrawalId } = req.params;

    if (bank_id === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'only banks can change the status'));
    } else {
      Withdrawal.findOne({
        where: { id : withdrawalId }
      })
      .then(withdrawal => {
        if (withdrawal === null) {
          res.status(404).json(errorResponseHelper(404, 'withdrawal request not found'));
        }

        if (withdrawal.dataValues.status === 'pending') {
          const updatedWithdrawal = { status };
          Withdrawal.update(updatedWithdrawal, {
            where: { id: withdrawalId }
          })
          .then(() => {
            Withdrawal.findOne({
              where: { id: withdrawalId },
              attributes: { exclude: ['payment_method_id'] },
              include: [{
                model: PaymentMethod,
                as: 'payment_method',
              }]
            })
            .then(withdrawal => {
              const { saving_book_id, total_amount } = withdrawal.dataValues;

              if (status === 'succeed') {
                connection.query(`UPDATE saving_books SET balance = balance - ${total_amount} WHERE id = '${saving_book_id}'`, { raw: true });
              }

              res.status(200).json({
                status_code: 200,
                message: 'successful',
                result: withdrawal
              });
            })
            .catch(err => {
              res.status(500).json(errorResponseHelper(500, err));
            })
          })
          .catch(err => {
            res.status(409).json(errorResponseHelper(409, err));
          })
        } else {
          res.status(403).json(errorResponseHelper(403, `can't change the status`));
        }
      })
    }
  });

  // Bank deletes withdrawal
  app.delete(`${endpoint_ver}/withdrawals/:withdrawalId`, checkAuth, (req, res, next) => {
    const { bank_id } = req.userData;
    const { withdrawalId } = req.params;

    if (bank_id === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'only banks can delete withdrawals'));
    } else {
      Withdrawal.findOne({
        where: { id: withdrawalId }
      })
      .then(withdrawal => {
        if (withdrawal === null) {
          res.status(404).json(errorResponseHelper(404, 'withdrawal request not found'));
        }

        if (withdrawal.dataValues.status === 'pending') {
          Withdrawal.destroy({
            where: { id: withdrawalId }
          })
          .then(() => {
            return res.status(200).json({
              status_code: 200,
              message: 'withdrawal deleted'
            });
          })
          .catch(err => {
            return res.status(500).json(errorResponseHelper(500, err));
          })
        } else {
          return res.status(403).json(errorResponseHelper(403, `withdrawal with ${withdrawal.dataValues.status} status can't be deleted`));
        }
      })
    }
  });

  // Detail Withdrawal
  app.get(`${endpoint_ver}/withdrawals/:withdrawalId`, checkAuth, (req, res, next) => {
    const { withdrawalId } = req.params;

    Withdrawal.findOne({
      where: { id: withdrawalId },
      attributes: { exclude: ['payment_method_id'] },
      include: [{
        model: PaymentMethod,
        as: 'payment_method',
      }]
    })
    .then(withdrawal => {
      if (withdrawal === null) {
        res.status(404).json(errorResponseHelper(404, 'withdrawal not found'));
      }

      res.status(200).json({
        status_code: 200,
        message: 'successful',
        result: withdrawal
      });
    })
    .catch(err => {
      res.status(500).json(errorResponseHelper(500, err));
    });
  })
};
