const bcrypt = require('bcryptjs');
const Isemail = require('isemail');

const User = require('../models/user');
const Password = require('../models/user_password');
const Token = require('../models/user_token');

const { populateUser } = require('./nestedModel')

module.exports = {
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
      const newUser = new User({email: userInput.email, displayName: userInput.username})
      const newPassword = new Password({email:userInput.email,username:userInput.username, password:bcrypt.hashSync(userInput.password,10)})
      newUser.passwords.push(newPassword)
      newPassword.users.push(newUser)
      const createdUser = await newUser.save();
      const createdPassword = await newPassword.save();
      return populateUser(createdUser)

    }
    catch(err){
      throw err
    }
        

    return {_id: "blablabla",displayName:"Arthur"}
  },
  createUserFromPassword: () => ([]),
  createPasswordForUser: () => ([]),
  createTokenForUser: () => ([]),
  users: async () => {
    try{
      const users = await User.find();
      return users.map(populateUser)
    }
    catch(err){
      throw err
    }
  }
}
