const Sequelize = require('sequelize');

const Deposit = require('../models/Deposit');
const SavingBook = require('../models/SavingBook');
const GarbageCategory = require('../models/GarbageCategory');

const connection = require('../config/connection');
const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  app.get(`${endpoint_ver}/deposits/saving_book=:savingBookId`, checkAuth, (req, res, next) => {
    const { savingBookId } = req.params;
    const { page, perPage } = pageQueryHelper(req.query);

    Deposit.findAndCountAll({
      where: { saving_book_id: savingBookId },
      limit: perPage,
      offset: (page - 1) * 10,
      attributes: { exclude: ['garbage_category_id', 'saving_book_id'] },
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
    .catch(err => {
      res.status(400).json(errorResponseHelper(400, err));
    });
  });

  // Create Deposit
  app.post(`${endpoint_ver}/deposits`, checkAuth, (req, res, next) => {
    const {
      saving_book_id, garbage_category_id, note, weight, amount_per_kg
    } = req.body;

    const newDeposit = Deposit.build({
      status: 'pending',
      saving_book_id,
      garbage_category_id,
      note,
      weight,
      amount_per_kg
    });

    newDeposit.save()
    .then(deposit => {
      // connection.query(`UPDATE saving_books SET balance = balance + ${amount_per_kg*weight} WHERE id = '${saving_book_id}'`, { raw: true })
      // .then(([result, metadata]) => console.log(metadata));

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

  // Bank change the deposit status to succeed/failed
  app.patch(`${endpoint_ver}/deposits/:depositId`, checkAuth, (req, res, next) => {
    const { bank_id } = req.userData;
    const { status } = req.body;
    const { depositId } = req.params;

    if (bank_id === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'only banks can change the status'));
    } else {
      Deposit.findOne({
        where: { id: depositId }
      })
      .then((deposit) => {
        if (deposit === null) {
          res.status(404).json(errorResponseHelper(404, 'deposit not found'));
        }

        if (deposit.dataValues.status === 'pending') {
          const updatedDeposit = { status };
          Deposit.update(updatedDeposit, {
            where: { id: depositId }
          })
          .then(() => {
            Deposit.findOne({
              where: { id: depositId },
              attributes: { exclude: ['garbage_category_id'] },
              include: [{
                model: GarbageCategory,
                as: 'garbage_category',
              }]
            })
            .then(deposit => {
              const { saving_book_id, weight, amount_per_kg } = deposit.dataValues;

              if (status === 'succeed') {
                connection.query(`UPDATE saving_books SET balance = balance + ${amount_per_kg*weight} WHERE id = '${saving_book_id}'`, { raw: true })
                .then(([result, metadata]) => console.log(metadata));
              }

              res.status(200).json({
                status_code: 200,
                message: 'successful',
                result: deposit
              });
            })
            .catch(err => {
              res.status(500).json(errorResponseHelper(500, err));
            });
          })
          .catch(err => {
            res.status(409).json(errorResponseHelper(409, err));
          })
        } else {
          res.status(403).json(errorResponseHelper(403, `can't change the status`));
        }
      });
    }

  });

  // Detail Deposit
  app.get(`${endpoint_ver}/deposits/:depositId`, checkAuth, (req, res, next) => {
    const { depositId } = req.params;

    Deposit.findOne({
      where: { id: depositId },
      attributes: { exclude: ['garbage_category_id', 'saving_book_id'] },
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

};
