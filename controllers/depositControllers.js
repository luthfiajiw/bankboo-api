const Sequelize = require('sequelize');

const Deposit = require('../models/Deposit');
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
const moment = require('moment');

module.exports = function(app) {
  app.get(`${endpoint_ver}/deposits`, checkAuth, (req, res, next) => {
    const { user_id } = req.userData;
    const { page, perPage } = pageQueryHelper(req.query);

    Deposit.findAndCountAll({
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

  // Create Deposit
  app.post(`${endpoint_ver}/deposits`, checkAuth, (req, res, next) => {
    const { user_id } = req.userData;
    const {
      saving_book_id, garbage_category_id, note, weight, total_amount
    } = req.body;

    const newDeposit = Deposit.build({
      saving_book_id,
      garbage_category_id,
      user_id,
      note,
      weight,
      total_amount
    });

    newDeposit.save()
    .then(deposit => {
      connection.query(`UPDATE saving_books SET balance = balance + ${total_amount} WHERE id = '${saving_book_id}'`, { raw: true })
      .then(([result, metadata]) => console.log(metadata));

      res.status(201).json({
        status_code: 201,
        message: 'new deposit has been created',
        result: deposit
      })
    })
    .catch(err => {
      res.status(400).json(errorResponseHelper(400, err));
    });
  });

  // Detail Deposit
  app.get(`${endpoint_ver}/deposits/:depositId`, checkAuth, (req, res, next) => {
    const { depositId } = req.params;

    Deposit.findOne({
      where: { id: depositId },
      attributes: { exclude: ['garbage_category_id', 'saving_book_id', 'user_id'] },
      include: [{
        model: GarbageCategory,
        as: 'garbage_category',
      }]
    })
    .then(deposit => {
      if (deposit === null) {
        res.status(404).json(errorResponseHelper(404, 'deposit not found'));
      }

      res.status(200).json({
        status_code: 200,
        message: 'successful',
        result: deposit
      });
    })
    .catch(err => {
      res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
    });
  })

  // Edit Deposit
  app.patch(`${endpoint_ver}/deposits/:depositId`, checkAuth, (req, res, next) => {
    const { depositId }  = req.params;
    const { garbage_category_id, note, weight, total_amount } = req.body;

    let updatedDeposit = {};
    if (garbage_category_id !== undefined) updatedDeposit['garbage_category_id'] = garbage_category_id;
    if (note !== undefined) updatedDeposit['note'] = note;
    if (weight !== undefined) updatedDeposit['weight'] = weight;
    if (total_amount !== undefined) updatedDeposit['total_amount'] = total_amount;

    Deposit.findByPk(depositId)
    .then(deposit => {
      if (deposit === null) {
        res.status(404).json(errorResponseHelper(404, 'deposit not found'));
      }

      const prevTotalAmount = deposit.dataValues.total_amount;

      Deposit.update(updatedDeposit, { where: {id: depositId} })
      .then(() => {
        Deposit.findOne({
          where: { id: depositId },
          attributes: { exclude: ['garbage_category_id', 'user_id'] },
          include: [{
            model: GarbageCategory,
            as: 'garbage_category',
          }]
        })
        .then(deposit => {
          if (total_amount !== undefined) {
            connection.query(`UPDATE saving_books SET balance = balance - ${prevTotalAmount} + ${total_amount} WHERE id = '${deposit.dataValues.saving_book_id}'`, { raw: true })
            .then(([result, metadata]) => console.log(metadata));
          }

          res.status(200).json({
            status_code: 200,
            message: 'successful',
            result: deposit
          });
        })
        .catch(err => {
          res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
        });
      })
      .catch((err) => res.status(404).json(errorResponseHelper(404, err)))

    })

  });

  // Delete Deposit
  app.delete(`${endpoint_ver}/deposits/:depositId`, checkAuth, (req, res, next) => {
    const { depositId } = req.params;

    Deposit.findByPk(depositId)
    .then(deposit => {
      if (deposit === null) {
        res.status(404).json(errorResponseHelper(404, 'deposit not found'));
      }

      Deposit.destroy({ where: {id: depositId} })
      .then(() => {
        connection.query(`UPDATE saving_books SET balance = balance - ${deposit.dataValues.total_amount} WHERE id = '${deposit.dataValues.saving_book_id}'`, { raw: true });
        res.status(200).json({
          status_code: 200,
          message: 'deposit deleted'
        });
      })
      .catch(() => {
        res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
      });
    })
  })
};
