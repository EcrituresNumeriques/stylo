const jwt = require('jsonwebtoken');
const atob = require('atob');
const bcrypt = require('bcryptjs');


const Password = require('../models/user_password');
const Token = require('../models/user_token');

module.exports = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  
  req.isAuth = false;
  // Case 0, no authorization header, go ahead

  if (!authHeader) {
    return next();
  }

  const method = authHeader.split(' ')[0]
  const payload = authHeader.split(' ')[1]

  // Case 1, we got a jwt for a session
  // Case 1.5, we got a jwt for a token
  if(method =="Bearer"){
    //console.log("Bearer token", payload)
    let decodedToken
    try{
      decodedToken = jwt.verify(payload,process.env.JWT_SECRET)
      if(!decodedToken){
        return next();
      }
      req.user = decodedToken
      req.isAuth = true;
      return next();
    }
    catch(err){
      //token mismatch or invalid
      return next();
    }
  }
  // case 2, we got credentials
  else if(method == "Basic"){
    //console.log("TODO basic auth username:password",atob(payload))

    const [username,password] = atob(payload).split(':')
    const fetchedPassword = await Password.findOne({username:username}).populate('users')
      if(!fetchedPassword){
        return next();
      }
      if(!await bcrypt.compare(password,fetchedPassword.password)){
        return next();
      }
      req.user = {
          usersIds:fetchedPassword.users.map(user => user._id.toString()),
          passwordId:fetchedPassword.id
      }
      req.isAuth = true;
      return next();
  }
  next();
};
