const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Password = require('../models/user_password');
const User = require('../models/user');
const Token = require('../models/user_token');

const populateArgs = require('../helpers/populateArgs');

const isUser = require('../policies/isUser')

const { populateUser, populatePassword, populateToken } = require('./nestedModel')

const verifCreds = async (args) => {
  try{
    let findProp = args.username? {username:args.username}:{email:args.email}
    const fetchedPassword = await Password.findOne(findProp).populate("users")
    if(!fetchedPassword){throw new Error("Password not found")}
    if(!await bcrypt.compare(args.password,fetchedPassword.password)){
      throw new Error("Password is incorrect");
    }
    return fetchedPassword
  }
  catch(err){
    throw err
  }
}

module.exports = {
  loginMutation: async (args,{req,_}) => {

    //The resolver only logs the user + password in the req object
    const fetchedPassword = await verifCreds(args);

    //Add password to the req.created list + add users in the req.list
    req.created = {...req.created, user:fetchedPassword.users[0].id, password:fetchedPassword.id}
    req.user = {
      usersIds:fetchedPassword.users.map(user => user._id.toString()),
      passwordId:fetchedPassword.id,
      admin:fetchedPassword.users.filter(user => user.admin).length > 0 ? true : false,
    }
    req.isAuth = true;

    return populatePassword(fetchedPassword)
  },
  login: async (args, {_,res}) => {
    try{
      const fetchedPassword = await verifCreds(args);
      const payload = {
        usersIds:fetchedPassword.users.map(user => user._id.toString()),
        passwordId:fetchedPassword.id,
        admin:fetchedPassword.users.filter(user => user.admin).length > 0 ? true : false,
        session:true
      }

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET_SESSION
      )
      const tokenCookie = jwt.sign(
        payload,
        process.env.JWT_SECRET_SESSION_COOKIE
      )

      //All query are async, can't channel req to another resolver
      //req.user = payload;
      //console.log("setting cookie:",tokenCookie,process.env.HTTPS);
      res.cookie("graphQL-jwt",tokenCookie,{expires:0,httpOnly:true,secure:process.env.HTTPS === "true"})

      return {
        token:token,
        token_cookie:tokenCookie,
        password:populatePassword(fetchedPassword),
        users:fetchedPassword.users.map(populateUser)
      }
    }
    catch(err){
      throw err
    }
  },
  changePassword: async (args, {req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //find Password + confirm it belongs to authentificated user
      const thisPassword = await Password.findOne({_id:args.password,users:args.user})
      if(!thisPassword){throw new Error('Password not found')}


      //check old password
      if(!await bcrypt.compare(args.old,thisPassword.password)){
        throw new Error("Old password is incorrect");
      }
      //Set new password
      thisPassword.password = bcrypt.hashSync(args.new,10)
      const fetchedPassword = await thisPassword.save()

      return populatePassword(fetchedPassword)

    }
    catch(err){
      throw err
    }
  },
  setPrimaryUser: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //Recover password
      const thisPassword = await Password.findOne({_id:args.password,users:args.user})
      if(!thisPassword){throw new Error('Unable to fetch password')}

      //Extract user from thisPassword.users and push it first
      thisPassword.users.pull(args.user)
      thisPassword.users.unshift(args.user)

      const returnPassword = await thisPassword.save()

      return populatePassword(returnPassword)

    }
    catch(err){
      throw err
    }
  },
  addCredential: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      const thisPassword = await Password.findOne({email:args.email})
      if(!thisPassword){throw new Error('Password not found')}
      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('User not found')}

      //Check if password or user not already in
      if(thisPassword.users.map(u => u.toString()).includes(thisUser.id)){throw new Error('Password already a credential')}
      if(thisUser.passwords.map(p => p.toString()).includes(thisPassword.id)){throw new Error('Users already a credential')}

      //All good
      thisPassword.users.push(thisUser)
      thisUser.passwords.push(thisPassword)

      await thisPassword.save()
      const returnUser = await thisUser.save()

      return populateUser(returnUser)
    }
    catch(err){
      throw err
    }
  },
  removeCredential: async (args, {req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      const thisPassword = await Password.findOne({email:args.email})
      if(!thisPassword){throw new Error('Password not found')}
      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('User not found')}

      //Check if email is the user's one
      if(thisUser.email === args.email){throw new Error('Can not remove master email')}

      //pull it from
      if(!thisPassword.users.map(u => u.toString()).includes(thisUser.id)){throw new Error('Password not a credential for this user')}
      if(!thisUser.passwords.map(p => p.toString()).includes(thisPassword.id)){throw new Error('Users not having this password as a credential')}

      //All good
      thisPassword.users.pull(thisUser)
      thisUser.passwords.pull(thisPassword)

      await thisPassword.save()
      const returnUser = await thisUser.save()

      return populateUser(returnUser)

    }
    catch(err){
      throw err
    }
  },
  refreshToken: async (_, {req, res}) => {
    if (!req.user) {
      throw new Error("Can't refresh user without cookie");
    }
    const fetchedPassword = await Password.findOne({ _id: req.user.passwordId }).populate("users")
    if (!fetchedPassword) {
      throw new Error("Password not found")
    }
    const payload = {
      email: req.user.email,
      usersIds: fetchedPassword.users.map(user => user._id.toString()),
      passwordId: fetchedPassword.id,
      admin: fetchedPassword.users.filter(user => user.admin).length > 0 ? true : false,
      session: true
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET_SESSION_COOKIE
    )

    res.cookie('graphQL-jwt', token, {
      expires: 0,
      httpOnly: true,
      secure: process.env.HTTPS === 'true'
    })

    return {
      token: token,
      password: populatePassword(fetchedPassword),
      users: fetchedPassword.users.map(populateUser)
    }
  },
  addToken: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('User not found')}

      //Generate Token in JWT + Token instance
      let newToken = new Token({name:args.name})
      const payload = {
        usersId:thisUser.id,
        tokenId:newToken.id,
        admin:thisUser.admin
      }
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET_TOKEN
      )


      newToken.user = thisUser.id
      newToken.token = bcrypt.hashSync(token,10)
      thisUser.tokens.push(newToken)
      let returnedToken = await newToken.save();
      await thisUser.save()

      returnedToken._doc.token = token

      req.created = {...req.created,token:returnedToken.id}

      return populateToken(returnedToken)

    }
    catch(err){
      throw err
    }
  },
  deleteToken: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('User not found')}
      const thisToken = await Token.findOne({_id:args.token})
      if(!thisToken){throw new Error('Token not found')}

      thisUser.tokens.pull(thisToken);

      const returnedUser = await thisUser.save()
      await Token.deleteOne({_id:args.token})

      return populateUser(returnedUser)
    }
    catch(err){
      throw err
    }
  }
}
