const bcrypt = require('bcryptjs');
const Isemail = require('isemail');

const User = require('../models/user');
const Password = require('../models/user_password');
const Article = require('../models/article');
const Version = require('../models/version');

const isUser = require('../policies/isUser')
const isAdmin = require('../policies/isAdmin')

const defaultsData = require('../data/defaultsData')

const { populateUser, getUserById } = require('./nestedModel')

const populateArgs = require('../helpers/populateArgs')

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
      newVersion.owner = createdUser
      await newVersion.save();

      //Save the user/article/version/password ID in the req object, for other resolver to consum with "new" ID
      req.created = {...req.created,article:newArticle.id,user:createdUser.id,version:newVersion.id,password:newPassword.id}

      return populateUser(createdUser)

    }
    catch(err){
      throw err
    }
  },
  addAcquintance: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      thisAcquintance = await User.findOne({email:args.email})
      if(!thisAcquintance){throw new Error('No user found with this email')}
      thisUser = await User.findOne({_id:args.user})

      //Check if acquintance is the user itself
      if(thisAcquintance.id === args.user){ throw new Error('Can not add yourself to acquintance')}

      //Check if acquintance is not already in array
      //console.log(thisUser.acquintances.map(a => a.toString()),thisAcquintance.id)
      if(thisUser.acquintances.map(a => a.toString()).includes(thisAcquintance.id)){ throw new Error('Email is already an acquintance')}

      //If all clear, add to acquintance
      thisUser.acquintances.push(thisAcquintance)
      const returnUser = await thisUser.save();

      return populateUser(returnUser)
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
  }  
}
