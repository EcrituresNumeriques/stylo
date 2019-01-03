const bcrypt = require('bcryptjs');
const Isemail = require('isemail');
const jwt = require('jsonwebtoken');

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
      const newUser = new User({email: userInput.email, displayName: userInput.username})
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
      let findProp = {...args}
      delete findProp.password
      const fetchedPassword = await Password.findOne(findProp)
      if(!fetchedPassword){throw new Error("Password not found")}
      if(!await bcrypt.compare(args.password,fetchedPassword.password)){
        throw new Error("Password is incorrect");
      }
      const payload = {
        usersIds:fetchedPassword.users.map(user => user._id.toString()),
        passwordId:fetchedPassword.id
      }
      console.log(payload)

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {expiresIn: '1h'}
      )
      req.user = payload;

      return {
        token:token, 
        tokenExpiration: 1, 
        password:populatePassword(fetchedPassword)
      }
    }
    catch(err){
      throw err
    }
  }
}
