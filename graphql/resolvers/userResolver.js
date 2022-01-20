const bcrypt = require('bcryptjs');
const Isemail = require('isemail');

const User = require('../models/user');
const Article = require('../models/article');

const isUser = require('../policies/isUser')
const isAdmin = require('../policies/isAdmin')

const defaultsData = require('../data/defaultsData')

const { getUserById } = require('./nestedModel')

const populateArgs = require('../helpers/populateArgs')

module.exports = {
  // Mutations
  createUser: async (args,{req}) => {
    const userInput = {...args.user}

    //Todo check if email is really an email
    if(!Isemail.validate(userInput.email)){
      throw new Error('Email is not correctly formated.');
    }

    //Check for Unique for User
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error('User with this email already exists!');
    }

    //Create user then password
    const newUser = new User({
      email: userInput.email,
      displayName: userInput.displayName || userInput.username,
      institution: userInput.institution || null,
      firstName: userInput.firstName || null,
      lastName: userInput.lastName || null
    });

    //Add default article + default version
    const defaultArticle = defaultsData.article
    const newArticle = new Article({ title:defaultArticle.title });

    newUser.articles.push(newArticle)
    newArticle.owners.push(newUser)


    const createdUser = await newUser.save();
    await newArticle.save();

    //Save the user/article/version/password ID in the req object, for other resolver to consum with "new" ID
    req.created = {
      ...req.created,
      article: newArticle.id,
      user:createdUser.id,
    }

    return createdUser
  },
  addAcquintance: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    let thisAcquintance = await User.findOne({email:args.email})
    if(!thisAcquintance){throw new Error('No user found with this email')}
    let thisUser = await User.findOne({_id:args.user})
    if(!thisUser){throw new Error('Unable to find user')}

    //Check if acquintance is the user itself
    if(thisAcquintance.id === args.user){ throw new Error('Can not add yourself to acquintance')}

    //Check if acquintance is not already in array
    //console.log(thisUser.acquintances.map(a => a.toString()),thisAcquintance.id)
    if(thisUser.acquintances.map(a => a.toString()).includes(thisAcquintance.id)){ throw new Error('Email is already an acquintance')}

    //If all clear, add to acquintance
    thisUser.acquintances.push(thisAcquintance)
    return thisUser.save();
  },
  updateUser: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    let thisUser = await User.findOne({_id:args.user})
    if(!thisUser){throw new Error('Unable to find user')}

    if('displayName' in args){thisUser.displayName = args.displayName}
    if('firstName' in args){thisUser.firstName = args.firstName}
    if('lastName' in args){thisUser.lastName = args.lastName}
    if('institution' in args){thisUser.institution = args.institution}
    if('yaml' in args){thisUser.yaml = args.yaml}
    if('zoteroToken' in args){thisUser.zoteroToken = args.zoteroToken}

    return thisUser.save()
  },
  // Queries

  //Only available for admins
  users: async (_,{req}) => {
    isAdmin(req);

    return User.find().populate('tags articles acquintances');
  },
  user: async (args, {req}) => {
    // if the userId is not provided, we take it from the auth token
    if (('user' in args) === false && req.user) {
      args.user = req.user.userId
    }

    isUser(args, req)

    return getUserById(args.user)
  }
}
