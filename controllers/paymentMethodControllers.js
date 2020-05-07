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
  })
};
