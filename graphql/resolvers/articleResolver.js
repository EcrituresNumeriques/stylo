const defaultsData = require('../data/defaultsData')

const Article = require('../models/article')
const User = require('../models/user')
const Workspace = require('../models/workspace')
const Version = require('../models/version')

const isUser = require('../policies/isUser')
const { ApiError } = require('../helpers/errors')
const { reformat } = require('../helpers/metadata.js')
const { computeMajorVersion, computeMinorVersion } = require('../helpers/versions')


async function getUser (userId) {
  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError('NOT_FOUND', `Unable to find user with id ${userId}`)
  }
  return user
}

async function getArticleByContext (articleId, context) {
  if (context.token.admin === true) {
    return await getArticle(articleId)
  }
  const userId = context.userId
  if (!userId) {
    throw new ApiError('UNAUTHENTICATED', `Unable to find an authentication context: ${context}`)
  }
  return await getArticleByUser(articleId, userId)
}

async function getArticle (articleId) {
  const article = await Article
    .findById(articleId)
    .populate('owner tags')
    .populate({ path: 'contributors', populate: { path: 'user' } })

  if (!article) {
    throw new ApiError('NOT_FOUND', `Unable to find article with id ${articleId}`)
  }
  return article
}

async function getArticleByUser (articleId, userId) {
  const userWorkspace = await Workspace.findOne({
    'members.user': userId,
    'articles': articleId
  })

  if (userWorkspace) {
    // article found in one of user's workspaces
    const article = await Article
      .findById(articleId)
      .populate('owner tags')
      .populate({ path: 'contributors', populate: { path: 'user' } })

    if (!article) {
      throw new ApiError('NOT_FOUND', `Unable to find article with id ${articleId}`)
    }
    return article
  }

  // find article by owner or contributors
  const article = await Article
    .findOne(
      {
        _id: articleId,
        $or: [
          { owner: userId },
          { contributors: { $elemMatch: { user: userId } } }
        ]
      }
    )
    .populate('owner tags')
    .populate({ path: 'contributors', populate: { path: 'user' } })

  if (!article) {
    throw new ApiError('NOT_FOUND', `Unable to find article with id ${articleId}`)
  }
  return article
}

module.exports = {
  Mutation: {
    /**
     * Create an article as the current user
     * @param {null} _root
     * @param {*} args
     * @param {{ userId, token }} context
     */
    async createArticle (_root, args, context) {
      const user = await getUser(context.userId)
      //Add default article + default version
      const newArticle = await Article.create({
        title: args.title || defaultsData.title,
        owner: user,
        workingVersion: {
          md: defaultsData.md,
          bib: defaultsData.bib,
          yaml: defaultsData.yaml,
        }
      })

      user.articles.push(newArticle)
      await user.save()
      return newArticle
    },

    async article (_root, { articleId }, context) {
      return getArticleByContext(articleId, context)
    },

    /**
     * Share an article as the current user
     *
     * @param {*} _root
     * @param {*} args
     * @param {{ userId, token }} context
     * @returns
     */
    async shareArticle (_root, args, context) {
      const withUser = await getUser(args.to)
      const article = await getArticleByContext(args.article, context)
      await article.shareWith(withUser)
      return article
    },

    /**
     * Unshare an article as the current user
     *
     * @param {null} _root
     * @param {*} args
     * @param {{ userId, token }} context
     * @returns
     */
    async unshareArticle (_root, args, context) {
      const withUser = await getUser(args.to)
      const article = await getArticleByContext(args.article, context)
      await article.unshareWith(withUser)
      return article
    },

    /**
     * Duplicate an article as the current user
     *
     * @param {null} _root
     * @param {*} args
     * @param {{ userId, token }} context
     * @returns
     */
    async duplicateArticle (_root, args, context) {
      const withUser = await getUser(args.to)
      const article = await getArticleByContext(args.article, context)
      const userId = context.userId
      const prefix = userId === args.to ? '[Copy] ' : '[Sent] '

      const newArticle = new Article({
        ...article.toObject(),
        _id: undefined,
        owner: withUser.id,
        contributors: [],
        versions: [],
        createdAt: null,
        updatedAt: null,
        title: prefix + article.title,
      })

      newArticle.isNew = true
      withUser.articles.push(newArticle)

      //Save the three objects
      await Promise.all([
        newArticle.save(),
        withUser.save()
      ])

      return newArticle
    },
  },

  Query: {
    /**
     * Fetch an article as the current user
     *
     * @param {null} _root
     * @param {*} args
     * @param {{ loaders: { article }, userId, token }} context
     * @returns
     */
    async article (_root, args, context) {
      return await getArticleByContext(args.article, context)
    },

    /**
     * Fetch all the articles related to a user:
     * - one stated by the JWT token (context.user), a User object
     * - one we are supposedly able ot impersonate (args.user), an ID
     *
     * We list:
     * - their articles
     * - their directly shared articles
     * - BUT not the granted account shared articles — we switch into their view for this
     *
     * @param {null} _root
     * @param {{ user?: String }} args
     * @param {{ user: User, token: Object, userId: String, loaders: { tags, users } }} context
     * @returns {Promise<Article[]>}
     */
    async articles (_root, args, context) {
      const { userId } = isUser(args, context)
      return Article.getArticles({
          filter: { $or: [{ owner: userId }, { contributors: { $elemMatch: { user: userId } } }] },
          loaders: context.loaders
        }
      )
    },
  },

  Article: {
    async workspaces (article, _, { user }) {
      if (user.admin) {
        return Workspace.find({ articles: article._id })
      }
      return Workspace.find({
        $and: [
          { articles: article._id },
          { 'members.user': user._id }
        ]
      })
    },

    async removeContributor (article, { userId }) {
      const contributorUser = await getUser(userId)
      await article.unshareWith(contributorUser)
      return article
    },

    async addContributor (article, { userId }) {
      const contributorUser = await User.findById(userId)
      if (!contributorUser) {
        throw new Error(`Unable to find user with id: ${userId}`)
      }
      await article.shareWith(contributorUser)
      return article
    },

    async versions (article, _args, context) {
      const versions = await Promise.all(article.versions.map(async (versionId) => await context.loaders.versions.load(versionId)))
      versions.sort((a, b) => b.createdAt - a.createdAt)
      console.log('Article.versions', {versions})
      return versions
    },

    /**
     * Delete an article a user has access to
     *
     * @param {import('mongoose').Document} article
     * @returns
     */
    async delete (article) {
      await article.remove()
      return article.$isDeleted()
    },

    async rename (article, { title }) {
      article.set('title', title)
      const result = await article.save({ timestamps: false })
      return result === article
    },

    async setZoteroLink (article, { zotero }) {
      article.set('zoteroLink', zotero)
      const result = await article.save({ timestamps: false })
      return result === article
    },

    async addTags (article, { tags }) {
      await article.addTags(...tags)
      return article.tags
    },

    async removeTags (article, { tags }) {
      await article.removeTags(...tags)
      return article.tags
    },

    async setPreviewSettings (article, { settings }) {
      await article.set('preview', settings, { merge: true }).save()
      return article
    },

    async updateWorkingVersion (article, { content }) {
      Object.entries(content)
        .forEach(([key, value]) => article.set({
          workingVersion: {
            [key]: value
          }
        }))

      return article.save()
    },

    async createVersion (article, { articleVersionInput }) {
      const { bib, yaml, md } = article.workingVersion

      /** @type {Query<Array<Article>>|Array<Article>} */
      const latestVersions = await Version.find({ _id: { $in: article.versions.map((a) => a._id) } })
        .sort({ createdAt: -1 })
        .limit(1)

      let mostRecentVersion = { version: 0, revision: 0 }
      if (latestVersions?.length > 0 ) {
        mostRecentVersion = {
          version: latestVersions[0].version,
          revision: latestVersions[0].revision,
        }
      }
      const { revision, version } = articleVersionInput.major
        ? computeMajorVersion(mostRecentVersion)
        : computeMinorVersion(mostRecentVersion)

      const createdVersion = await Version.create({
        md,
        yaml,
        bib,
        version,
        revision,
        message: articleVersionInput.message,
        owner: articleVersionInput.userId,
      }).then((v) => v.populate('owner').execPopulate())

      article.versions.unshift(createdVersion)
      await article.save()
      return article
    }
  },

  WorkingVersion: {
    yaml ({ yaml }, { options }) {
      return options?.strip_markdown
        ? reformat(yaml, { replaceBibliography: false })
        : yaml
    }
  },
}
