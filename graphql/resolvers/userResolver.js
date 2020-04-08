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

  addAcquintance: async (args,{req}) => {
    try{
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
      const returnUser = await thisUser.save();

      return populateUser(returnUser)
    }
    catch(err){
      throw err
    }
  },
  updateUser: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      let thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('Unable to find user')}

      if(args.displayName){thisUser.displayName = args.displayName}
      if(args.firstName){thisUser.firstName = args.firstName}
      if(args.lastName){thisUser.lastName = args.lastName}
      if(args.institution){thisUser.institution = args.institution}
      if(args.yaml){thisUser.yaml = args.yaml}
      const returnedUser = await thisUser.save()

      return populateUser(returnedUser)


    }
    catch(err){
      throw err
    }
  },
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
