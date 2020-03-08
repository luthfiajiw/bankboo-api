const jwt = require('jsonwebtoken');
const { isEmpty } = require('lodash');
const errorResponseHelper = require('../helpers/errorResponseHelper');

module.exports = async (req, res, next) => {
  try {
    const token = isEmpty(req.query.token)
    ? req.headers.authorization.split(' ')[1]
    : req.query.token

    const decoded = jwt.verify(token, 'secretBankboo');
    req.userData = decoded;
    next();
  } catch (e) {
    return res.status(401).json(errorResponseHelper(401, 'authentication failed'));
  }
};
