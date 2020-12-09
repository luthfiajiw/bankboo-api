const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

const checkAuth = require('../config/checkAuth');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  // Get customers data
  app.get(`${endpoint_ver}/user/customers`, checkAuth, (req, res) => {
    const { page, perPage } = pageQueryHelper(req.query);
    const { is_super_admin } = req.userData;

    if (is_super_admin === undefined) {
      return res.status(403).json(errorResponseHelper(403, 'only admin can see the user list'));
    } else {
      User.findAndCountAll({
        limit: perPage,
        offset: (page - 1) * 10,
        attributes: { exclude: ['password'] }
      })
      .then(customers => {
        const totalPage = customers.count === 0 ? 1 : Math.ceil(customers.count/perPage);
        console.log(customers.count);

        const pagination = paginationHelper(page, perPage, totalPage);
        const datas = {
          ...customers,
          ...pagination
        }
        responseHelper(res, datas);
      });
    }

  });

  // Checking user email
  app.post(`${endpoint_ver}/customers/is-existed-email`, (req, res) => {
    const { email } = req.body;

    User.findAll({ where: { email } })
      .then(user => {
        if (user.length < 1) {
          return res.status(200).json({
            status_code: 200,
            message: 'email is available',
            email,
            is_existed_email: false
          });
        }

        return res.status(200).json({
          status_code: 200,
          message: 'email is not available',
          email,
          is_existed_email: true
        });
      })
  });

  // Customer Signin
  app.post(`${endpoint_ver}/customer/signin`, (req, res, next) => {
    const { email, password } = req.body;

    User.findAll({ where: { email } })
      .then(user => {
        if (user.length < 1) {
          return res.status(404).json(errorResponseHelper(404, 'authentication failed, email is not registered'))
        }

        bcrypt.compare(password, user[0].password, (err, isMatch) => {
          if (err) {
            return res.status(401).json(errorResponseHelper(401, 'authenticaiton failed'))
          }

          if (isMatch) {
            const token = jwt.sign({
              email: user[0].email,
              user_id: user[0].id,
            }, 'secretBankboo');

            return res.status(200).json({
              status_code: 200,
              message: 'authentication successful',
              type: 'Bearer',
              access_token: token
            })
          } else {
            return res.status(401).json(errorResponseHelper(401, 'authentication failed, please check your password'))
          }
        })
      })
  })

  // Customer Signup
  app.post(`${endpoint_ver}/customer/signup`, (req, res, next) => {
    const { first_name, last_name, mobile_phone, email, password, password2 } = req.body;

    // Check the length of password
    if (password.length < 6) {
      return res.status(406).json(errorResponseHelper(406, 'password should be at least 6 characters'));
    }

    // Check password matching
    if (password !== password2) {
      return res.status(406).json(errorResponseHelper(406, 'password don\'t match'));
    }

    User.findAll({
      where: { email: email },
    })
      .then(user => {
        if (user.length > 0) {
          return res.status(409).json(errorResponseHelper(409, 'email is already registered'));
        } else {
          let splitPhone = mobile_phone.split('');
          if (mobile_phone[0] === '0') {
            splitPhone.splice(0, 1, '+62');
          } else {
            splitPhone.unshift('+62');
          }

          const newUser = User.build({
            first_name: first_name,
            mobile_phone: splitPhone.join(''),
            last_name: last_name,
            fullname: `${first_name} ${last_name}`,
            email: email,
            password: password,
          });
          bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              return res.status(500).json(errorResponseHelper(500, err));
            }
            newUser.password = hash;
            newUser.save()
              .then(user => {
                res.status(201).json({
                  status_code: 201,
                  message: 'new user has been created',
                  result: user
                });
              })
              .catch(err => {
                res.status(400).json({
                  error: {
                    status_code: 400,
                    message: err
                  }
                });
              })
          }))
        }
      })
      .catch(err => {
        res.status(500).json(errorResponseHelper(500, err));
      })
  });
};
