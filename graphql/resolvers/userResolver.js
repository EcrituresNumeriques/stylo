const User = require('../models/user')
const Article = require('../models/article')

const isUser = require('../policies/isUser')
const isAdmin = require('../policies/isAdmin')

const defaultsData = require('../data/defaultsData')

module.exports = {
  Mutation: {
    async createUser (_, { details: userInput }) {
      //Check for User uniqueness
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
        password: userInput.password,
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
    async addAcquintance (_, args, context) {
      const { userId } = isUser(args, context)

      let thisAcquintance = await User.findOne({ email: args.email })
      if (!thisAcquintance) {
        throw new Error('No user found with this email')
      }
      let thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('Unable to find user')
      }

      //Check if acquintance is the user itself
      if (thisAcquintance.id === userId) {
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
      await thisUser.save()
      return thisUser.populate('acquintances').execPopulate()
    },
    async grantAccountAccess (_, args, context) {
      const { userId } = isUser(args, context)

      const thisUser = await User.findById(userId)
        .populate('acquintances')
        .populate({ path: 'permissions', populate: 'user' })

      const remoteUser = await User.findById(args.to)

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
    async revokeAccountAccess (_, args, context) {
      const { userId } = isUser(args, context)

      const thisUser = await User.findById(userId)
        .populate('acquintances')
        .populate({ path: 'permissions', populate: 'user' })

      const remoteUser = await User.findById(args.to)

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

    async updateUser (_, args, context) {
      const { userId } = isUser(args, context)
      const { details } = args

      let thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('Unable to find user')
      }

      ['displayName', 'firstName', 'lastName', 'institution', 'yaml', 'zoteroToken'].forEach(field => {
        if (field in details) {
          thisUser[field] = details[field]
        }
      })

      return thisUser.save()
    },
  },
  Query: {
    //Only available for admins
    async users (_, args, { user }) {
      isAdmin({ user })

      return User.find().populate('tags articles acquintances')
    },
    async user (_, args, context) {
      const { userId, fromSharedUserId } = isUser(args, context)

      if (fromSharedUserId) {
        const sharedUserIds = await User.findAccountAccessUserIds(context.token._id)

        if (!sharedUserIds.includes(fromSharedUserId)) {
          throw new Error('Forbidden')
        }
      }

      return User.findById(fromSharedUserId ?? userId)
        .populate('tags acquintances')
        .populate({ path: 'permissions', populate: 'user' })
    },

    userGrantedAccess(_, args, context) {
      isUser(args, context)

      return User.findAccountAccessUsers(context.token._id)
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
