const bcrypt = require('bcryptjs')
const Isemail = require('isemail')

const User = require('../models/user')
const Article = require('../models/article')

const isUser = require('../policies/isUser')
const isAdmin = require('../policies/isAdmin')

const defaultsData = require('../data/defaultsData')

module.exports = {
  Mutation: {
    async createUser (_, { user: userInput }) {
      //Todo check if email is really an email
      if (!Isemail.validate(userInput.email)) {
        throw new Error('Email is not correctly formated.')
      }

      //Check for Unique for User
      const existingUser = await User.findOne({ email: userInput.email })
      if (existingUser) {
        throw new Error('User with this email already exists!')
      }

      //Create user then password
      const newUser = new User({
        email: userInput.email,
        displayName: userInput.displayName || userInput.username,
        institution: userInput.institution || null,
        firstName: userInput.firstName || null,
        lastName: userInput.lastName || null,
        password: bcrypt.hashSync(userInput.password, 10),
        authType: 'local',
      })

      //Add default article + default version
      const defaultArticle = defaultsData.article
      const newArticle = new Article({ title: defaultArticle.title })

      newUser.articles.push(newArticle)
      newArticle.owner = newUser

      const createdUser = await newUser.save()
      await newArticle.save()

      return createdUser
    },
    async addAcquintance (_, args, { user }) {
      isUser(args, { user })

      let thisAcquintance = await User.findOne({ email: args.email })
      if (!thisAcquintance) {
        throw new Error('No user found with this email')
      }
      let thisUser = await User.findOne({ _id: args.user })
      if (!thisUser) {
        throw new Error('Unable to find user')
      }

      //Check if acquintance is the user itself
      if (thisAcquintance.id === args.user) {
        throw new Error('Can not add yourself to acquintance')
      }

      //Check if acquintance is not already in array
      if (
        thisUser.acquintances
          .map((a) => a.toString())
          .includes(thisAcquintance.id)
      ) {
        throw new Error('Email is already an acquintance')
      }

      //If all clear, add to acquintance
      thisUser.acquintances.push(thisAcquintance)
      return thisUser.save()
    },
    async grantAccountAccess (_, args, { user }) {
      isUser(args, { user })

      const thisUser = await User.findOne({ _id: args.user })
        .populate('acquintances')
        .populate({ path: 'permissions', populate: 'user' })

      const remoteUser = await User.findOne({ _id: args.to })

      const existingsScope = thisUser.permissions.find(
        (p) => p.scope === 'user' && p.user._id == remoteUser.id
      )

      if (existingsScope) {
        throw new Error(
          `Account [id: ${args.to}] has already access to account [id: ${args.user}]`
        )
      }

      thisUser.permissions.push({
        scope: 'user',
        user: remoteUser.id,
        roles: ['access', 'read', 'write'],
      })

      return thisUser
        .save()
        .then((u) =>
          u.populate({ path: 'permissions', populate: 'user' }).execPopulate()
        )
    },
    async revokeAccountAccess (_, args, { user }) {
      isUser(args, { user })

      const thisUser = await User.findOne({ _id: args.user })
        .populate('acquintances')
        .populate({ path: 'permissions', populate: 'user' })

      const remoteUser = await User.findOne({ _id: args.to })

      const existingsScope = thisUser.permissions.find(
        (p) => p.scope === 'user' && p.user._id == remoteUser.id
      )

      if (!existingsScope) {
        throw new Error(
          `Account [id: ${args.to}] has no access to account [id: ${args.user}]`
        )
      }

      thisUser.permissions.pull(existingsScope)

      return thisUser.save()
    },

    async updateUser (_, args, { user }) {
      isUser(args, { user })

      let thisUser = await User.findOne({ _id: args.user })
      if (!thisUser) {
        throw new Error('Unable to find user')
      }

      if ('displayName' in args) {
        thisUser.displayName = args.displayName
      }
      if ('firstName' in args) {
        thisUser.firstName = args.firstName
      }
      if ('lastName' in args) {
        thisUser.lastName = args.lastName
      }
      if ('institution' in args) {
        thisUser.institution = args.institution
      }
      if ('yaml' in args) {
        thisUser.yaml = args.yaml
      }
      if ('zoteroToken' in args) {
        thisUser.zoteroToken = args.zoteroToken
      }

      return thisUser.save()
    },
  },
  Query: {
    //Only available for admins
    async users (_, args, { user }) {
      isAdmin({ user })

      return User.find().populate('tags articles acquintances')
    },
    async user (_, args, { user }) {
      // if the userId is not provided
      // we assume it is the user from the token
      // otherwise, it is expected we request articles from a shared account
      args.user =
        'user' in args === false && user ? String(user._id) : args.user

      const fromSharedUserId = args.user !== user?._id ? args.user : null
      const userId = user?._id.toString()

      if (fromSharedUserId) {
        const sharedUserIds = await User.findAccountAccessUserIds(user?._id)

        if (!sharedUserIds.includes(fromSharedUserId)) {
          throw new Error('Forbidden')
        }
      } else {
        isUser(args, { user })
      }

      return User.findById(fromSharedUserId ?? userId)
        .populate('tags acquintances')
        .populate({ path: 'permissions', populate: 'user' })
    },

    userGrantedAccess(_, args, { user }) {
      return User.findAccountAccessUsers(user?._id)
    },
  },

  User: {
    async articles(user, { limit }) {
      await user.populate({ path: 'articles', options: { limit } }).execPopulate()

      return user.articles
    },

    async article (user, { id: _id }) {
      await user.populate({ path: 'articles', match: { _id }}).execPopulate()

      return user.articles[0]
    }
  },
}
