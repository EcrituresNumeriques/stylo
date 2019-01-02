const jwt = require('jsonwebtoken');

const Password = require('../models/user_password');
const Token = require('../models/user_token');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.user.userId = decodedToken.userId;
  if(decodedToken.passwordId){
    await Password.findByIdAndUpdate(decodedToken.passwordId);
    req.user.passwordId = decodedToken.passwordId;
  }
  else if(decodedToken.tokenId){
    await Token.findByIdAndUpdate(decodedToken.token);
    req.user.token = decodedToken.token;
  }
  else{req.user.session = true}
  next();
};
