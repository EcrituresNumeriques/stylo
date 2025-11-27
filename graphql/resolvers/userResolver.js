const User = require('../models/user')

const isUser = require('../policies/isUser')
const Workspace = require('../models/workspace')
const Article = require('../models/article')
const Tag = require('../models/tag')
const { BadRequestError } = require('../helpers/errors')
const { createJWTToken } = require('../helpers/token.js')

const config = require('../config.js')

/**
 * @typedef {import('../models/user.js')} User
 * @typedef {import('../helpers/token.js').RequestContext} RequestContext
 * @typedef {import('../loaders.js').Loaders} DataLoaders
 */

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
        connectedAt: Date.now(),
      })
      await newUser.createDefaultArticle()
      return newUser
    },

    /**
     * Create account after two steps login
     * @param {DataLoaders} _
     * @param {Object} args
     * @param {Object} args.details Form details
     * @param {'humanid'|'hypothesis'|'zotero'} args.service Only used to validate GraphQL mutation.
     * @param {RequestContext} context
     * @returns {Promise<string>}
     */
    async createUserWithAuth(_, { details }, { session }) {
      // link accounts
      if (!session?.pendingRegistration) {
        throw new BadRequestError(
          'REGISTRATION_NOT_FOUND',
          'No registration found'
        )
      }

      const user = await User.create({
        // will unwrap 'email, 'authProviders' and possibly 'displayName'
        ...session.pendingRegistration,
        // we want to keep the user defined choice if any
        displayName:
          details.displayName || session.pendingRegistration.displayName,
        firstName: details.firstName,
        lastName: details.lastName,
        institution: details.institution,
        connectedAt: Date.now(),
      })

      await user.createDefaultArticle()
      delete session.pendingRegistration

      return createJWTToken({
        user,
        jwtSecret: config.get('security.jwt.secret'),
      })
    },

    async logout(_, args, { token, user, session }) {
      isUser({}, { token, user })

      delete session.fromAccount
      delete session.pendingRegistration

      session.destroy()

      return null
    },

    /**
     * Set an authentication token based on info previously stored in the session
     * It works both after coming back with a new user (not known to any account) or linked to an existing account
     * @param {import('../loaders.js').Loaders} _
     * @param {{ service: 'zotero' | 'humanid' | 'hypothesis' }} params
     * @param {import('../helpers/token.js').RequestContext} context
     * @returns {Promise<User>}
     */
    async setAuthToken(_, { service }, { token, user, session }) {
      isUser({}, { token, user })

      const authProviderKey = `authProviders.${service}`

      if (!session?.pendingRegistration?.authProviders) {
        throw new BadRequestError(
          'ACCOUNT_NOT_FOUND',
          'No remote account data found'
        )
      }

      // pending linking account
      // we need to verify if the credentials are not already linked to another account
      if (session.fromAccount) {
        // eslint-disable-next-line security/detect-object-injection
        const remoteId = session.pendingRegistration.authProviders[service].id
        const existingUser = await User.findOne({
          [`authProviders.${service}.id`]: remoteId,
        })

        // we do not check if we link against the same user
        // I don't know if this is a path that can be taken
        if (existingUser) {
          const error = new BadRequestError(
            'ACCOUNT_ALREADY_LINKED',
            'This account is already linked to another Stylo user.'
          )
          error.status = 409

          throw error
        }
      }

      // eslint-disable-next-line security/detect-object-injection
      const data = session.pendingRegistration.authProviders[service]

      // workaround the absence of `merge` option for `MongooseMap.$set()`
      user.set(authProviderKey, {
        ...(user.get(authProviderKey)?.toObject({ flattenMaps: true }) ?? {}),
        ...data,
        updatedAt: Date.now(),
      })

      // clean up transient registration/linking data
      delete session.pendingRegistration
      delete session.fromAccount

      return await user.save()
    },

    /**
     * Disconnect a remote account from Stylo
     *
     * @param {*} _
     * @param {*} param1
     * @param {*} param2
     * @returns {Promise<User>}
     */
    async unsetAuthToken(_, { service }, { token, user }) {
      isUser({}, { token, user })

      // TODO revoke token from remote service

      // check if not the last account
      if (!user.password && user.getAuthProvidersCount() === 1) {
        throw new BadRequestError(
          'LAST_ACCOUNT',
          'You cannot remove the last authentication method'
        )
      }

      //
      const authProviderKey = `authProviders.${service}`
      user.set(authProviderKey, null)

      return await user.save()
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
      return thisUser.populate('acquintances')
    },

    async updateUser(_, args, context) {
      const { userId } = isUser(args, context)
      const { details } = args

      let thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('Unable to find user')
      }

      ;['displayName', 'firstName', 'lastName', 'institution', 'yaml'].forEach(
        (field) => {
          if (Object.hasOwn(details, field)) {
            /* eslint-disable security/detect-object-injection */
            thisUser.set(field, details[field])
          }
        }
      )

      return thisUser.save()
    },
  },

  Query: {
    async user(_root, args, context) {
      if (!context.userId) {
        return null
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
      await user.populate({
        path: 'articles',
        options: { limit },
        populate: { path: 'owner tags' },
      })
      return user.articles
    },

    async acquintances(user, args, context) {
      return Promise.all(
        user.acquintances.map((contactId) =>
          context.loaders.users.load(contactId)
        )
      )
    },

    authProviders(user) {
      return {
        humanid: user.get('authProviders.humanid'),
        hypothesis: user.get('authProviders.hypothesis'),
        zotero: user.get('authProviders.zotero'),
      }
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
