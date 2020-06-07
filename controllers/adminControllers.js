const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');

const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  // Get admins
  app.get(`${endpoint_ver}/admins`, checkAuth, (req, res) => {
    const { is_super_admin } = req.userData;
    const { page, perPage } = pageQueryHelper(req.query);

    if (is_super_admin === undefined || is_super_admin === false) {
      return res.status(403).json(errorResponseHelper(403, 'only superadmin can see the admin list'));
    } else {
      Admin.findAndCountAll({
        limit: perPage,
        offset: (page - 1) * 10,
        attributes: { exclude: ['password'] }
      })
      .then(admins => {
        const totalPage = customers.count === 0 ? 1 : Math.ceil(customers.count/perPage);
        console.log(customers.count);

        const pagination = paginationHelper(page, perPage, totalPage);
        const datas = {
          ...customers,
          ...pagination
        }
        responseHelper(res, datas);
      })
      .catch(err => {});
    }

  });

  // Admin Signin
  app.post(`${endpoint_ver}/admin/signin`, (req, res, next) => {
    const { email, password } = req.body;

    Admin.findAll({ where: { email } })
    .then(admins => {
      if (admins.length < 1) {
        return res.status(404).json(errorResponseHelper(404, 'email is not registered'))
      }

      bcrypt.compare(password, admins[0].password, (err, isMatch) => {
        if (err) {
          return res.status(401).json(errorResponseHelper(401, 'authenticaiton failed'));
        }

        if (isMatch) {
          const token = jwt.sign({
            email: admins[0].email,
            admin_id: admins[0].id,
            is_super_admin: admins[0].is_super_admin,
            is_accessing_payment_methods: admins[0].is_accessing_payment_methods,
            is_accessing_garbage_categories: admins[0].is_accessing_garbage_categories,
          }, 'secretBankboo');

          return res.status(200).json({
            status_code: 200,
            message: 'authentication successful',
            type: 'Bearer',
            access_token: token
          })
        } else {
          return res.status(401).json(errorResponseHelper(401, 'authentication failed, please check you email or password'))
        }
      })
    })
  });

  // Add Admin
  app.post(`${endpoint_ver}/admin/add`, checkAuth, (req, res, next) => {
    const { userData } = req;
    const { fullname, email, password, is_super_admin, is_accessing_payment_methods, is_accessing_garbage_categories } = req.body;

    if (!userData.is_super_admin || userData.is_super_admin === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'only superadmin can invite'));
    } else {
      // Check the length of password
      if (password.length < 6) {
        return res.status(406).json(errorResponseHelper(406, 'password should be at least 6 characters'));
      }

      Admin.findAll({ where: { email } })
      .then(admins => {
        if (admins.length > 0) {
          return res.status(409).json(errorResponseHelper(409, 'email is already registered'));
        } else {
          const newAdmin = Admin.build({
            fullname,
            email,
            password,
            is_super_admin,
            is_accessing_payment_methods,
            is_accessing_garbage_categories
          });

          bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newAdmin.password, salt, (err, hash) => {
            if (err) {
              return res.status(500).json(errorResponseHelper(500, err));
            }

            newAdmin.password = hash;
            newAdmin.save()
            .then(admin => {
              res.status(201).json({
                status_code: 201,
                message: 'new admin has been added',
                result: admin
              });
            })
            .catch(err => {
              return res.status(400).json(errorResponseHelper(400, err));
            });
          }))
        }
      })
    }
  });

  // Super Admin Signup
  app.post(`${endpoint_ver}/superadmin/signup`, (req, res, next) => {
    const { fullname, email, password } = req.body;

    // Check the length of password
    if (password.length < 6) {
      return res.status(406).json(errorResponseHelper(406, 'password should be at least 6 characters'));
    }

    Admin.findAll({ where: { email } })
    .then(admins => {
      if (admins.length > 0) {
        return res.status(409).json(errorResponseHelper(409, 'email is already registered'));
      } else {
        const newSuperadmin = Admin.build({
          fullname,
          email,
          password,
          is_super_admin: true,
          is_accessing_garbage_categories: true,
          is_accessing_payment_methods: true
        });

        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newSuperadmin.password, salt, (err, hash) => {
          if (err) {
            return res.status(500).json(errorResponseHelper(500, err));
          }

          newSuperadmin.password = hash;
          newSuperadmin.save()
          .then(superadmin => {
            res.status(201).json({
              status_code: 201,
              message: 'new super admin has been created',
              result: superadmin
            });
          })
          .catch(err => {
            return res.status(400).json(errorResponseHelper(400, err));
          });
        }))
      }
    })
  })
};
