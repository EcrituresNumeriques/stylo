const { Y } = require('../helpers/yjs-utils.mjs')
const mongoose = require('mongoose')
const attachable = require('./plugins/attachable.js')
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
  // WebDAV storage only
  // TODO encrypt tokens at rest (AES-256-GCM)
  url: {
    type: String,
  },
  // detected server, e.g. nextcloud, and its web interface
  kind: {
    type: String,
  },
  webUrl: {
    type: String,
  },
  updatedAt: Date,
  linkedAt: Date,
})

const AccessSchema = new Schema(
  {
    at: Date,
    ip: String,
    strategy: String,
  },
  { _id: false }
)

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
    acquintances: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
      set: (password) =>
        password ? bcrypt.hashSync(password.trim(), 10) : null,
    },
    firstName: String,
    lastName: String,
    institution: String,
    lastAccesses: [AccessSchema],
    deletedAt: Date,
  },
  {
    timestamps: true,
    methods: {
      /**
       * Keeps the 10 most recent accesses, the newest first. Does not save.
       *
       * @param {{ at: Date, ip: string|null, strategy: string }} access
       */
      recordAccess(access) {
        this.lastAccesses.unshift(access)
        this.lastAccesses.splice(10)
      },

      /**
       * Merges data into an auth provider, keeping the fields it does not override.
       * Does not save.
       *
       * @param {'humanid'|'hypothesis'|'zotero'} service
       * @param {object} data
       */
      mergeAuthProvider(service, data) {
        const key = `authProviders.${service}`
        this.set(key, {
          ...(this.get(key)?.toObject({ flattenMaps: true }) ?? {}),
          ...data,
        })
      },

      /**
       * Compare an existing password against a user input one.
       *
       * There is a possibility the initial password is not set.
       * If that's the case, we compare the login password to itself.
       *
       * @param {String} password
       * @returns {Promise<Boolean>}
       */
      async comparePassword(password) {
        const oldPassword = this.password ?? bcrypt.hashSync(password, 10)
        return bcrypt.compare(password, oldPassword)
      },

      // TODO exclude `webdav`, which is a storage and not a login method
      getAuthProvidersCount() {
        return Array.from(this.authProviders.values()).filter((d) => d).length
      },

      async createDefaultArticle() {
        // create a yjs document from the default text (Markdown)
        const yDoc = new Y.Doc()
        try {
          const yText = yDoc.getText('main')
          yText.insert(0, defaultArticle.md)
          const documentState = Y.encodeStateAsUpdate(yDoc) // is a Uint8Array
          const newArticle = await this.model('Article').create({
            title: defaultArticle.title,
            zoteroLink: defaultArticle.zoteroLink,
            owner: this,
            workingVersion: {
              metadata: defaultArticle.metadata,
              bib: defaultArticle.bib,
              ydoc: Buffer.from(documentState).toString('base64'),
            },
          })
          await newArticle.createNewVersion({ mode: 'MINOR', user: this })
          return this.save()
        } finally {
          yDoc.destroy()
        }
      },

      async softDelete() {
        // generate a random/unguessable email because email is a unique index
        const email = `deleted-user-${randomUUID({ disableEntropyCache: true })}@example.com`

        this.set({
          authProviders: {},
          deletedAt: Date.now(),
          displayName: '[deleted user]',
          email,
          firstName: '',
          institution: null,
          lastAccesses: [],
          lastName: '',
          password: null,
        })

        return await this.save()
      },
    },
  }
)

userSchema.virtual('authTypes').get(function authTypes() {
  const types = new Set()

  if (this.password) {
    types.add('local')
  }

  // TODO exclude `webdav`, which is a storage and not a login method
  const hasRemoteAuth = Object.entries(this.authProviders ?? {}).some(
    ([, { id, email, token }]) => id || email || token
  )

  if (hasRemoteAuth) {
    types.add('oidc')
  }

  return Array.from(types)
})

userSchema.plugin(attachable)

module.exports = mongoose.model('User', userSchema)
