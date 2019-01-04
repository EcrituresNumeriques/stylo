const bcrypt = require('bcryptjs');
const Isemail = require('isemail');
const jwt = require('jsonwebtoken');
const ms = require('ms');

const User = require('../models/user');
const Password = require('../models/user_password');

const { populateUser, getUserById, populatePassword } = require('./nestedModel')

module.exports = {

  // Mutations

  createUser: async args => {
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
      const createdUser = await newUser.save();
      await newPassword.save();
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
  
  users: async () => {
    try{
      const users = await User.find();
      return users.map(populateUser)
    }
    catch(err){
      throw err
    }
  },
  user: async (args) => {
    try{
      return await getUserById(args._id)
    }
    catch(err){
      throw err
    }
  },
  login: async (args, req) => {
    try{
      //login via email or username
      console.log("login",args)
      let findProp = args.username? {username:args.username}:{email:args.email}
      const fetchedPassword = await Password.findOne(findProp)
      if(!fetchedPassword){throw new Error("Password not found")}
      if(!await bcrypt.compare(args.password,fetchedPassword.password)){
        throw new Error("Password is incorrect");
      }
      const payload = {
        usersIds:fetchedPassword.users.map(user => user._id.toString()),
        passwordId:fetchedPassword.id
      }

      const expiration = args.expiration || '1h'
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn: expiration}
      )
      req.user = payload;

      return {
        token:token, 
        tokenExpiration: ms(expiration),  
        password:populatePassword(fetchedPassword)
      }
    }
    catch(err){
      throw err
    }
  },
  refreshToken: async (args, req) => {
    if(!req.isAuth || !req.user){
      throw new Error("Can't refresh user not logged");
    }
    const fetchedPassword = await Password.findOne({_id : req.user.passwordId})
    if(!fetchedPassword){throw new Error("Password not found")}
    const payload = { usersIds:req.user.usersIds, passwordId: req.user.passwordId}
    const expiration = args.expiration || '1h'
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {expiresIn: expiration}
    )
    return {
      token:token, 
      tokenExpiration: ms(expiration), 
      password:populatePassword(fetchedPassword)
    }
  }
}
