const jwt = require('jsonwebtoken');

// const Password = require('../models/user_password');
// const Token = require('../models/user_token');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  console.log(req.get('Authorization'))
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  next();
};
