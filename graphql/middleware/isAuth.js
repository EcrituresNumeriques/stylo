const jwt = require('jsonwebtoken');
const atob = require('atob');
const bcrypt = require('bcryptjs');

const isEquivalent = require('../helpers/isEquivalent')

const Password = require('../models/user_password');
const Token = require('../models/user_token');

module.exports = async (req, _, next) => {
  
  req.isAuth = false;
  
  //console.log("entered middleware");
  // Case 1, we got a cookie for a session, but no header
  if(req.cookies && req.cookies['graphQL-jwt']){
    try{
      const noCRSF = jwt.verify(req.cookies['graphQL-jwt'],process.env.JWT_SECRET_SESSION_COOKIE)
      if(noCRSF && noCRSF.session){
        req.user_noCSRF = noCRSF
        //console.log("we got a token",noCRSF)
      }
    }
    catch(err){
      // cookietoken mismatch or invalid
      //console.log("exiting error in the cookie")
      return next();
    }
  }
  
  const authHeader = req.get('Authorization');
  //If no auth header, no need to continue checking stuff
  if (!authHeader) {
    //console.log("exiting no header")
    return next();
  }
  
  const method = authHeader.split(' ')[0]
  const payload = authHeader.split(' ')[1]


  // case 1,5 we got a cookie + a jwt header
  if(method =="Bearer" && req.user_noCSRF){
    try{
      const token = jwt.verify(payload,process.env.JWT_SECRET_SESSION)
      if(token && token.session){
        delete token.iat
        delete req.user_noCSRF.iat
        //console.log("testing the two tokens",token,req.user_noCSRF,isEquivalent(token,req.user_noCSRF))
        if(isEquivalent(token,req.user_noCSRF)){
          req.user = req.user_noCSRF;
          req.isAuth = true;
          //console.log("exiting session loggin complete")
          return next();
        }
      }
    }
    catch(err){
      // cookietoken mismatch or invalid
      //console.log("exiting error in the header+cookie")
      return next();
    }




  }

  // Case 2, we got a jwt for a token
  else if(method =="Bearer"){
    // Bearer token, payload is the token
    let decodedToken
    try{
      decodedToken = jwt.verify(payload,process.env.JWT_SECRET)
      if(!decodedToken){
        //console.log("exiting token not verified")
        return next();
      }

      // TODO: check token in the database, check if still valid

      req.user = decodedToken
      req.isAuth = true;
      //console.log("exiting token complete")
      return next();
    }
    catch(err){
      //token mismatch or invalid
      //console.log("exiting error in the token")
      return next();
    }
  }
  // case 3, we got credentials
  else if(method == "Basic"){
    // basic auth username:password <= base64 atob(payload)
    const [username,password] = atob(payload).split(':')
    const fetchedPassword = await Password.findOne({username:username}).populate('users')
      if(!fetchedPassword){
        //console.log("exiting no password")
        return next();
      }
      if(!await bcrypt.compare(password,fetchedPassword.password)){
        //console.log("exiting password mismatch")
        return next();
      }
      req.user = {
          usersIds:fetchedPassword.users.map(user => user._id.toString()),
          passwordId:fetchedPassword.id
      }
      req.isAuth = true;
      //console.log("exiting password success")
      return next();
  }
  //console.log("exiting alone")
  return next();
};
