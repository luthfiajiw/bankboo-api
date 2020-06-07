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

  // Admin adds a category
  app.post(`${endpoint_ver}/garbage-categories`, checkAuth, (req, res, next) => {
    const { is_accessing_garbage_categories } = req.userData;
    const { category, name } = req.body;

    if (!is_accessing_garbage_categories || is_accessing_garbage_categories === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'you are not allowed to add a category'));
    } else {
      const newGarbageCategory = GarbageCategory.build({
        category,
        name
      });

      newGarbageCategory.save()
      .then(garbageCategory => {
        res.status(201).json({
          status_code: 201,
          message: "new garbage category has been created",
          result: garbageCategory
        });
      })
      .catch(err => res.status(400).json(errorResponseHelper(400, err)));
    }
  });

  // Admin updates a category
  app.patch(`${endpoint_ver}/garbage-categories/:garbageCategoryId`, checkAuth, (req, res, next) => {
    const { is_accessing_garbage_categories } = req.userData;
    const { category, name } = req.body;
    const { garbageCategoryId } = req.params;

    if (!is_accessing_garbage_categories || is_accessing_garbage_categories === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'you are not allowed to update a category'));
    } else {
      GarbageCategory.findOne({
        where: { id: garbageCategoryId }
      })
      .then(garbageCategory => {
        if (garbageCategory === null) {
          res.status(404).json(errorResponseHelper(404, 'garbage category not found'));
        }

        const updatedGarbageCategory = { category, name };
        GarbageCategory.update(updatedGarbageCategory, {
          where: { id: garbageCategoryId }
        })
        .then(() => {

          GarbageCategory.findOne({
            where: { id: garbageCategoryId },
          })
          .then(garbageCategory => {
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

  // Admin delete a category
  app.delete(`${endpoint_ver}/garbage-categories/:garbageCategoryId`, checkAuth, (req, res, next) => {
    const { is_accessing_garbage_categories } = req.userData;
    const { garbageCategoryId } = req.params;

    if (!is_accessing_garbage_categories || is_accessing_garbage_categories === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'you are not allowed to delete a category'));
    } else {
      GarbageCategory.findByPk(garbageCategoryId)
      .then(garbageCategory => {
        if (garbageCategory === null) {
          return res.status(404).json(errorResponseHelper(404, 'garbage category not found'));
        }

        GarbageCategory.destroy({ where: { id: garbageCategoryId } })
        .then(() => {
          res.status(200).json({
            status_code: 200,
            message: 'garbage category deleted'
          })
        })
      })
    }
  })
};
