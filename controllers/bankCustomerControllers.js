const Sequelize = require('sequelize');

const BankCustomer = require('../models/BankCustomer');
const User = require('../models/User');

const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  app.get(`${endpoint_ver}/bank-customers`, checkAuth, (req, res, next) => {
    const { bank_id } = req.userData;
    const { page, perPage } = pageQueryHelper(req.query);

    BankCustomer.findAndCountAll({
      where: { bank_id },
      limit: perPage,
      offset: (page - 1) * 10,
      attributes: { exclude: ['customer_id', 'bank_id', 'saving_book_id'] },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: {exclude: ['last_login', 'password', 'created_at', 'updated_at']}
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

  app.post(`${endpoint_ver}/bank-customers`, checkAuth, (req, res, next) => {

  });
};
