const Sequelize = require('sequelize');

const PaymentMethod = require('../models/PaymentMethod');

const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  app.get(`${endpoint_ver}/payment-methods`, checkAuth, (req, res, next) => {
    const { page, perPage } = pageQueryHelper(req.query);

    PaymentMethod.findAndCountAll({
      limit: perPage,
      offset: (page - 1) * 10,
    })
    .then(paymentMethods => {
      const totalPage = paymentMethods.count === 0 ? 1 : Math.ceil(paymentMethods.count/perPage);
      const pagination = paginationHelper(page, perPage);
      const datas = {
        ...paymentMethods,
        ...pagination
      }
      responseHelper(res, datas);
    });
  });

  // Admin adds a payment method
  app.post(`${endpoint_ver}/payment-methods`, checkAuth, (req, res, next) => {
    const { is_accessing_payment_methods } = req.userData;
    const { code, name } = req.body;

    if (!is_accessing_payment_methods || is_accessing_payment_methods === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'you are not allowed to add a payment method'));
    } else {
      const newPaymentMethod = PaymentMethod.build({
        code,
        name
      });

      newPaymentMethod.save()
      .then(paymentMethod => {
        res.status(201).json({
          status_code: 201,
          message: 'new payment method has been added',
          result: paymentMethod
        })
        .catch(err => res.status(400).json(errorResponseHelper(400, err)));

      })
    }
  });

  // Admin updates a payment method
  app.patch(`${endpoint_ver}/payment-methods/:paymentMethodId`, checkAuth, (req, res, next) => {
    const { is_accessing_payment_methods } = req.userData;
    const { code, name } = req.body;
    const { paymentMethodId } = req.params;

    if (!is_accessing_payment_methods || is_accessing_payment_methods === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'you are not allowed to update a payment method'));
    } else {
      PaymentMethod.findByPk(paymentMethodId)
      .then(paymentMethod => {
        if (paymentMethod === null) {
          return res.status(404).json(errorResponseHelper(404, 'payment method not found'));
        }

        const updatedPaymentMethod = { code, name };
        PaymentMethod.update(updatedPaymentMethod, {
          where: { id: paymentMethodId }
        })
        then(() => {

          PaymentMethod.findOne({
            where: { id: paymentMethodId }
          })
          .then(paymentMethod => {
            return res.status(200).json({
              status_code: 200,
              message: 'successful',
              result: garbageCategory
            });
          })
          .catch(err => res.status(500).json(errorResponseHelper(500, err)));

        })
        .catch(err => res.status(409).json(errorResponseHelper(409, err)));
      })
    }
  });

  // Admin deletes
  app.delete(`${endpoint_ver}/payment-methods/:paymentMethodId`, checkAuth, (req, res, next) => {
    const { is_accessing_payment_methods } = req.userData;
    const { paymentMethodId } = req.params;

    if (!is_accessing_payment_methods || is_accessing_payment_methods === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'you are not allowed to delete a payment method'));
    } else {
      PaymentMethod.findByPk(paymentMethodId)
      .then(paymentMethod => {
        if (paymentMethod === null) {
          return res.status(404).json(errorResponseHelper(404, 'payment method not found'));
        }

        PaymentMethod.destroy({
          where: { id: paymentMethodId }
        })
        .then(() => {
          return res.status(200).json({
            status_code: 200,
            message: 'payment method deleted'
          });
        })
      })
    }
  });
  
};
