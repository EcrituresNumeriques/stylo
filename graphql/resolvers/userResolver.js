const User = require('../models/user')

const isUser = require('../policies/isUser')
const Workspace = require('../models/workspace')
const Article = require('../models/article')
const Tag = require('../models/tag')
const { ApiError } = require('../helpers/errors')

module.exports = {
  Mutation: {
    async createUser(_, { details: userInput }) {
      // check for user uniqueness
      const existingUser = await User.findOne({ email: userInput.email })
      if (existingUser) {
        throw new Error('User with this email already exists!')
      }
      // create a user
      const newUser = await User.create({
        email: userInput.email,
        username: userInput.username,
        displayName: userInput.displayName || userInput.username,
        institution: userInput.institution || null,
        firstName: userInput.firstName || null,
        lastName: userInput.lastName || null,
        password: userInput.password,
        authType: 'local',
      })
      await newUser.createDefaultArticle()
      return newUser
    },

    async setAuthToken(_, args, { token, user }) {
      const { service, token: serviceToken } = args

      isUser(args, { token, user })

      if (service === 'zotero') {
        user.zoteroToken = serviceToken
        await user.save()
      } else {
        throw new Error(`Service unknown (${service})`)
      }

      return user
    },

    async addAcquintance(_, args, context) {
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

    async updateUser(_, args, context) {
      const { userId } = isUser(args, context)
      const { details } = args

      let thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('Unable to find user')
      }

      ;[
        'displayName',
        'firstName',
        'lastName',
        'institution',
        'yaml',
        'zoteroToken',
      ].forEach((field) => {
        if (Object.hasOwn(details, field)) {
          /* eslint-disable security/detect-object-injection */
          thisUser.set(field, details[field])
        }
      })

      return thisUser.save()
    },
  },

  Query: {
    async user(_root, args, context) {
      if (!context.userId) {
        throw new ApiError(
          'UNAUTHENTICATED',
          `Unable to find an authentication context: ${JSON.stringify(context)}`
        )
      }
      return User.findById(context.userId)
    },

    async getUser(_, { filter }, context) {
      isUser({}, context)
      return User.findOne({ email: filter.email })
    },
  },

  User: {
    async articles(user, { limit }) {
      await user
        .populate({
          path: 'articles',
          options: { limit },
          populate: { path: 'owner tags' },
        })
        .execPopulate()
      return user.articles
    },

    async acquintances(user, args, context) {
      return Promise.all(
        user.acquintances.map((contactId) =>
          context.loaders.users.load(contactId)
        )
      )
    },

    /**
     * @param user
     * @returns {Promise<void>}
     */
    async tags(user) {
      return Tag.find({ owner: user._id }).lean()
    },

    async workspaces(user, args, { token }) {
      if (token?.admin) {
        return Workspace.find()
      }
      return Workspace.find({ 'members.user': user?._id })
    },

    async addContact(user, { userId }) {
      if (user._id === userId) {
        throw new Error('You cannot add yourself as a contact!')
      }
      const contact = await User.findById(userId)
      if (!contact) {
        throw new Error(`No user found with this id: ${userId}`)
      }
      return User.findOneAndUpdate(
        { _id: user._id },
        { $push: { acquintances: contact._id } },
        { new: true }
      )
    },

    async removeContact(user, { userId }) {
      const contact = await User.findById(userId)
      if (!contact) {
        throw new Error(`No user found with this id: ${userId}`)
      }
      return User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { acquintances: contact._id } },
        { new: true }
      )
    },

    async stats(user) {
      const contributedArticlesCount = (
        await Article.find({ contributors: { $elemMatch: { user: user._id } } })
      ).length
      return {
        myArticlesCount: user.articles.length,
        contributedArticlesCount,
      }
    },
  },
}
