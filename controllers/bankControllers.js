const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Bank = require('../models/Bank');
const pageQueryHelper = require('../helpers/pageQueryHelper');
const responseHelper = require('../helpers/responseHelper');
const paginationHelper = require('../helpers/paginationHelper');
const errorResponseHelper = require('../helpers/errorResponseHelper');
const { endpoint_ver } = require('../config/url');

module.exports = function(app) {
  // Get banks data
  app.get(`${endpoint_ver}/user/banks`, (req, res) => {
    const { page, perPage } = pageQueryHelper(req.query);
    Bank.findAndCountAll({
      limit: perPage,
      offset: (page - 1) * 10,
      attributes: { exclude: ['password'] }
    })
    .then(banks => {
      const totalPage = banks.count === 0 ? 1 : Math.ceil(banks.count/perPage);
      console.log(banks.count);

      const pagination = paginationHelper(page, perPage, totalPage);
      const datas = {
        ...banks,
        ...pagination
      }
      responseHelper(res, datas);
    });
  });

  // Bank Signin
  app.post(`${endpoint_ver}/bank/signin`, (req, res, next) => {
    const { email, password } = req.body;

    Bank.findAll({ where: { email } })
      .then(bank => {
        if (bank.length < 1) {
          return res.status(404).json(errorResponseHelper(404, 'email is not registered'))
        }

        bcrypt.compare(password, bank[0].password, (err, isMatch) => {
          if (err) {
            return res.status(401).json(errorResponseHelper(401, 'authenticaiton failed'))
          }

          if (isMatch) {
            const token = jwt.sign({
              email: bank[0].email,
              bank_id: bank[0].id,
              role: bank[0].role
            }, 'secretBankboo');

            return res.status(200).json({
              status_code: 200,
              message: 'authenticaiton successful',
              type: 'Bearer',
              token
            })
          } else {
            return res.status(401).json(errorResponseHelper(401, 'authentication failed, please check you email or password'))
          }
        })
      })
  });

  // Bank Signup
  app.post(`${endpoint_ver}/bank/signup`, (req, res, next) => {
    const { name, phone, email, address, password, password2 } = req.body;

    // Check the length of password
    if (password.length < 6) {
      return res.status(406).json(errorResponseHelper(406, 'password should be at least 6 characters'));
    }

    // Check password matching
    if (password !== password2) {
      return res.status(406).json(errorResponseHelper(406, 'password don\'t match'));
    }

    console.log(req.body);

    Bank.findAll({ where: { email: email } })
      .then(bank => {
        if (bank.length > 0) {
          return res.status(409).json(errorResponseHelper(409, 'email is already registered'));
        } else {
          let splitPhone = phone.split('');
          if (phone[0] === '0') {
            splitPhone.splice(0, 1, '+62')
          } else {
            splitPhone.unshift('+62')
          }

          const newBank = Bank.build({
            role: 'bank',
            name,
            email,
            phone: splitPhone.join(''),
            address,
            password,
          });
          bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newBank.password, salt, (err, hash) => {
            if (err) {
              return res.status(500).json(errorResponseHelper(500, err));
            }
            newBank.password = hash;
            newBank.save()
              .then(bank => {
                res.status(201).json({
                  status_code: 201,
                  message: 'new bank has been created',
                  result: bank
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
        res.status(500).json(errorResponseHelper(500, 'Internal Server Error'));
      })
  });
};
