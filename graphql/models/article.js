const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { computeMajorVersion, computeMinorVersion } = require('../helpers/versions.js')
const { previewEntries } = require('../helpers/bibliography.js')
const { prefixRulesWith, sanitizeTemplate } = require('../helpers/preview.js')

const ArticleContributorSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  roles: [String]
})

const articleSchema = new Schema({
  title: {
    type: String,
    required: true,
    default: 'autocreated'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  contributors: [ArticleContributorSchema],
  zoteroLink: {
    type: String,
    default: ''
  },
  workingVersion: {
    md: {
      type: String,
      default: ''
    },
    yaml: {
      type: String,
      default: ''
    },
    bib: {
      type: String,
      default: ''
    },
  },
  versions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Version'
    }
  ],
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  preview: {
    stylesheet: {
      type: String,
      default: '',
      set: prefixRulesWith.bind(null, 'stylo-pagedjs-container')
    },
    template: {
      type: String,
      default: '',
      set: sanitizeTemplate
    }
  }
}, { timestamps: true })

articleSchema.virtual('workingVersion.bibPreview').get(function () {
  return previewEntries(this.workingVersion.bib)
})


/**
 * Returns a single article for a given user
 *
 * @param {{ _id: String, user: String }}
 * @returns Article
 */
articleSchema.statics.findOneByOwner = function findOneByOwner ({ _id, user }) {
  return this
    .findOne({ _id, $or: [{ owner: { $in: user } }, { contributors: { $elemMatch: { user: { $in: user } } } }] })
    .populate({ path: 'contributors', populate: 'user' })
}

/**
 * Returns articles for a given user
 *
 * @param {{ userId: String }}
 * @returns {Array<Article>}
 */
articleSchema.statics.findManyByOwner = function findManyByOwner ({ userId }) {
  return this
    .find({ $or: [{ owner: userId }, { contributors: { $elemMatch: { user: userId } } }] })
    .sort({ updatedAt: -1 })
    .populate([
      { path: 'tags', options: { sort: { createdAt: -1 } } },
      { path: 'owner', },
      { path: 'contributors', populate: 'user' }
    ])
}

/**
 * Load associated data on a list of articles using data loaders.
 * @param articles a list of lean articles
 * @param {{ users, tags }} loaders
 * @returns {Promise<Article[]>}
 */
articleSchema.statics.complete = async function populate (articles, loaders) {
  return Promise.all(articles.map(async (article) => {
    article.tags = await Promise.all(article.tags.map(async (tagId) => await loaders.tags.load(tagId)))
    article.owner = await loaders.users.load(article.owner)
    article.contributors = await Promise.all(article.contributors.map(async (contributor) => {
      contributor.user = await loaders.users.load(contributor.user)
      return contributor
    }))
    return article
  }))
}

/**
 * Get populated articles.
 * @param {{ filter: {}, loaders: { users, tags } }} context
 * @returns {Promise<Article[]>}
 */
articleSchema.statics.getArticles = async function getArticles ({ filter, loaders }) {
  const articles = await this
    .find(filter)
    .sort({ updatedAt: -1 })
    .lean()
  return this.complete(articles, loaders)
}

/**
 * Returns a single article, fully populated for a given user, or a list of users with sharing permissions
 *
 * @param {String} articleId
 * @param {String} userId active user
 * @param {User[]} grantees list of accounts in which we can request this article for
 * @returns Article
 */
articleSchema.statics.findAndPopulateOneByOwners = function findAndPopulateOneByOwners (articleId, user) {
  // if $in is empty, we are in a case where we have an admin token fetching the data
  const $in = user.$inFromGrantees()
  const _id = articleId

  // We want to query an article with a given ID
  // AND match it with a single owner
  // OR match it with one of many contributors
  const query = Array.isArray($in) && $in.length
    ? { _id, $or: [{ owner: { $in } }, { contributors: { $elemMatch: { user: { $in } } } }] }
    : { _id }

  return this
    .findOne(query)
    .populate([
      { path: 'tags', options: { sort: { createdAt: -1 } } },
      {
        path: 'owner',
      }
    ])
    .populate({ path: 'versions', options: { sort: { createdAt: -1 } }, populate: { path: 'owner' } })
    .populate({ path: 'contributors', populate: { path: 'user' } })
}

articleSchema.methods.addTags = async function addTags (...tagIds) {
  // Step 1 : add tags to article
  this.tags.push(...tagIds)

  // Step 2 : populate article tags
  await this.populate('tags').execPopulate()

  // now, add the article reference in these tags
  await this.model('Tag').updateMany(
    { _id: { $in: tagIds } },
    { $push: { articles: this.id } },
    { safe: true }
  )

  return this.save({ timestamps: false })
}

articleSchema.methods.removeTags = async function removeTags (...tagIds) {
  // Step 1 : remove tags to article
  this.tags.pull(...tagIds)

  // Step 2 : populate article tags
  await this.populate('tags').execPopulate()

  // now, add the article reference in these tags
  await this.model('Tag').updateMany(
    { _id: { $in: tagIds } },
    { $pull: { articles: this.id } },
    { safe: true }
  )

  return this.save({ timestamps: false })
}

articleSchema.methods.shareWith = async function shareWith (user) {
  const isAlreadyShared = this.contributors.find(({ user: u }) => u.equals(user))

  if (isAlreadyShared) {
    return
  }

  this.contributors.push({ user, roles: ['read', 'write'] })

  return Promise.all([
    this.save({ timestamps: false }),
    user.save({ timestamps: false })
  ])
}

articleSchema.methods.unshareWith = async function shareWith (user) {
  // we keep only contributors who are not the one we unshare with
  // @see https://mongoosejs.com/docs/api.html#document_Document-equals
  this.contributors = this.contributors.filter(({ user: u }) => u.equals(user) === false)

  // we keep it for legacy sake
  // because technically, we do not push the article in the user's list
  user.articles.pull(this)

  return Promise.all([
    this.save({ timestamps: false }),
    user.save({ timestamps: false })
  ])
}

articleSchema.methods.createNewVersion = async function createNewVersion ({ mode, message, user }) {
  const { bib, yaml, md } = this.workingVersion
  const mostRecentVersion = this.versions.at(0)

  const { revision, version } = mode === 'MAJOR'
    ? computeMajorVersion(mostRecentVersion)
    : computeMinorVersion(mostRecentVersion)

  const createdVersion = await this.model('Version').create({
    md,
    yaml,
    bib,
    version,
    revision,
    message,
    owner: user.id,
  }).then((v) => v.populate('owner').execPopulate())

  this.versions.push(createdVersion)
  await this.save()

  return createdVersion
}

articleSchema.pre('remove', async function () {
  await this.populate('owner').execPopulate()

  const session = await this.db.startSession()

  await session.withTransaction(async () => {
    // remove article from nested owner articles
    this.owner.articles.pull(this.id)
    await this.owner.save()

    // remove articles from tags owned by this user
    await this.model('Tag').updateMany(
      { owner: this.owner.id },
      { $pull: { articles: this.id } },
      { safe: true }
    )
  })

  await session.commitTransaction()
  return session.endSession()
})

articleSchema.post('remove', async function () {
  await this.model('User').updateOne(
    { _id: this.owner?.id || this.owner },
    { $pull: { articles: this.id } },
    { safe: true }
  )
})

module.exports = mongoose.model('Article', articleSchema)
module.exports.schema = articleSchema
