const Sequelize = require('sequelize');

const GarbageCategory = require('../models/GarbageCategory');

const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  app.get(`${endpoint_ver}/garbage-categories`, checkAuth, (req, res, next) => {
    const { page, perPage } = pageQueryHelper(req.query);

    GarbageCategory.findAndCountAll({
      limit: perPage,
      offset: (page - 1) * 10,
    })
    .then(garbageCategories => {
      const totalPage = garbageCategories.count === 0 ? 1 : Math.ceil(garbageCategories.count/perPage);
      const pagination = paginationHelper(page, perPage);
      const datas = {
        ...garbageCategories,
        ...pagination
      }
      responseHelper(res, datas);
    });
  })
};
