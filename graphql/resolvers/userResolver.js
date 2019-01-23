const bcrypt = require('bcryptjs');
const Isemail = require('isemail');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Password = require('../models/user_password');
const Article = require('../models/article');
const Version = require('../models/version');

const isUser = require('../policies/isUser')
const isAdmin = require('../policies/isAdmin')

const defaultsData = require('../data/defaultsData')

const { populateUser, getUserById, populatePassword } = require('./nestedModel')

module.exports = {

  // Mutations

  createUser: async (args,{req}) => {
    try{
      const userInput = {...args.user}

      //Todo check if email is really an email
      if(!Isemail.validate(userInput.email)){
        throw new Error('Email is not correctly formated.');
      }

      //Check for Unique for User
      const existingUser = await User.findOne({$or:[{ email: userInput.email },{displayName: userInput.username}]});
      if (existingUser) {
        throw new Error('User with this email/username exists already.');
      }
      //Check for Unique for Password
      const existingPassword = await Password.findOne({$or:[{ email: userInput.email },{username: userInput.username}]});
      if (existingPassword) {
        throw new Error('Password with this email/username exists already.');
      }

      //Create user then password
      const newUser = new User({
        email: userInput.email,
        displayName: userInput.displayName || userInput.username,
        institution: userInput.institution || null,
        firstName: userInput.firstName || null,
        lastName: userInput.lastName || null
      });
      const newPassword = new Password({email:userInput.email,username:userInput.username, password:bcrypt.hashSync(userInput.password,10)})
      newUser.passwords.push(newPassword)
      newPassword.users.push(newUser)


      //Add default article + default version
      const defaultArticle = defaultsData.article
      const newArticle = new Article({title:defaultArticle.title});
      const newVersion = new Version({md:defaultArticle.md,yaml:defaultArticle.yaml,bib:defaultArticle.bib,sommaire:defaultArticle.sommaire});
      newArticle.versions.push(newVersion)
      newVersion.article = newArticle

      newUser.articles.push(newArticle)
      newArticle.owners.push(newUser)


      const createdUser = await newUser.save();
      await newPassword.save();
      await newArticle.save();
      await newVersion.save();

      //Save the user/article/version/password ID in the req object, for other resolver to consum with "new" ID
      req.created = {...req.created,article:newArticle.id,user:createdUser.id,version:newVersion.id,password:newPassword.id}

      return populateUser(createdUser)

    }
    catch(err){
      throw err
    }
  },
  createUserFromPassword: () => ([]),
  createPasswordForUser: () => ([]),
  createTokenForUser: () => ([]),

  // Queries
  
  //Only available for admins
  users: async (_,{req}) => {
    try{
      isAdmin(req);
      const users = await User.find();
      return users.map(populateUser)
    }
    catch(err){
      throw err
    }
  },
  user: async (args,{req}) => {
    try{
      isUser(args,req)
      return await getUserById(args.user)
    }
    catch(err){
      throw err
    }
  },
  login: async (args, {req,res}) => {
    try{
      //login via email or username
      let findProp = args.username? {username:args.username}:{email:args.email}
      const fetchedPassword = await Password.findOne(findProp).populate("users")
      if(!fetchedPassword){throw new Error("Password not found")}
      if(!await bcrypt.compare(args.password,fetchedPassword.password)){
        throw new Error("Password is incorrect");
      }
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
      console.log("setting cookie:",tokenCookie);
      res.cookie("graphQL-jwt",tokenCookie,{expires:0,httpOnly:true,secure:process.env.HTTPS})

      return {
        token:token,
        password:populatePassword(fetchedPassword),
        users:fetchedPassword.users.map(populateUser)
      }
    }
    catch(err){
      throw err
    }
  },
  refreshToken: async (_, {req}) => {
    if(!req.user_noCSRF){
      throw new Error("Can't refresh user without cookie");
    }
    const fetchedPassword = await Password.findOne({_id : req.user_noCSRF.passwordId}).populate("users")
    if(!fetchedPassword){throw new Error("Password not found")}
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
    return {
      token:token,
      password:populatePassword(fetchedPassword),
      users:fetchedPassword.users.map(populateUser)
    }
  }
}
