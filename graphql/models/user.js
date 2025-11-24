const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('node:crypto')

const { article: defaultArticle } = require('../data/defaultsData')

const Schema = mongoose.Schema

const AuthProviderSchema = new Schema({
  id: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  token: {
    type: String,
  },
  updatedAt: Date,
})

const userSchema = new Schema(
  {
    email: {
      type: String,
      set(value) {
        return String(value).trim()
      },
    },
    displayName: {
      type: String,
      set(value) {
        return String(value).trim()
      },
    },
    // unique but not required, we need to create a sparse index manually
    username: {
      type: String,
      set(value) {
        return String(value).trim()
      },
    },
    // TODO remove this link
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    acquintances: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    articles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
    authProviders: {
      type: Map,
      of: AuthProviderSchema,
      default: {},
    },
    password: {
      type: String,
      default: null,
      required: false,
      set: (password) => password ? bcrypt.hashSync(password.trim(), 10) : null,
    },
    firstName: String,
    lastName: String,
    institution: String,
    connectedAt: Date,
    deletedAt: Date
  },
  { timestamps: true }
)

/**
 * Compare an existing password against a user input one.
 *
 * There is a possibility the initial password is not set.
 * If that's the case, we compare the login password to itself.
 *
 * @param {String} password
 * @returns {Promise<Boolean>}
 */
userSchema.methods.comparePassword = async function comparePassword(password) {
  const oldPassword = this.password ?? bcrypt.hashSync(password, 10)
  return bcrypt.compare(password, oldPassword)
}

userSchema.methods.getAuthProvidersCount = function getAuthProvidersCount() {
  return Array.from(this.authProviders.values()).filter((d) => d).length
}

userSchema.methods.createDefaultArticle =
  async function createDefaultArticle() {
    const newArticle = await this.model('Article').create({
      title: defaultArticle.title,
      zoteroLink: defaultArticle.zoteroLink,
      owner: this,
      workingVersion: {
        metadata: defaultArticle.metadata,
        bib: defaultArticle.bib,
        md: defaultArticle.md,
      },
    })

    await newArticle.createNewVersion({ mode: 'MINOR', user: this })

    this.articles.push(newArticle)
    return this.save()
  }

userSchema.virtual('authTypes').get(function authTypes() {
  const types = new Set()

  if (this.password) {
    types.add('local')
  }

  const hasRemoteAuth = Object.entries(this.authProviders ?? {}).some(
    ([, { id, email, token }]) => id || email || token
  )

  if (hasRemoteAuth) {
    types.add('oidc')
  }

  return Array.from(types)
})

userSchema.methods.softDelete =  async function softDeleteUser() {
  // generate a random/unguessable email because email is a unique index
  const email = `deleted-user-${randomUUID({ disableEntropyCache: true })}@example.com`

  this.set({
    authProviders: {},
    deletedAt: Date.now(),
    displayName: '[deleted user]',
    email,
    firstName: '',
    institution: null,
    lastName: '',
    password: null,
  })

  return await this.save()
}

module.exports = mongoose.model('User', userSchema)
