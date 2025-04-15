const YAML = require('js-yaml')
const { getYDoc } = require('y-websocket/bin/utils')

const Article = require('../models/article.js')
const User = require('../models/user.js')
const Corpus = require('../models/corpus.js')
const Workspace = require('../models/workspace.js')
const Version = require('../models/version.js')

const isUser = require('../policies/isUser.js')
const { ApiError } = require('../helpers/errors.js')
const { reformat } = require('../helpers/metadata.js')
const {
  computeMajorVersion,
  computeMinorVersion,
} = require('../helpers/versions.js')
const { previewEntries } = require('../helpers/bibliography.js')
const { logger } = require('../logger.js')
const { toLegacyFormat } = require('../helpers/metadata.js')
const Y = require('yjs')
const { mongo } = require('mongoose')
const Sentry = require('@sentry/node')

function getTextFromYjsDoc(yjsdocBase64) {
  const documentState = Buffer.from(yjsdocBase64, 'base64')
  const yjsdoc = getYDoc(`ws/${new mongo.ObjectID().toString()}`)
  try {
    Y.applyUpdate(yjsdoc, documentState)
    return yjsdoc.getText('main').toString()
  } finally {
    yjsdoc.destroy()
  }
}

async function getUser(userId) {
  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError('NOT_FOUND', `Unable to find user with id ${userId}`)
  }
  return user
}

async function getArticleByContext(articleId, context) {
  if (context.token.admin === true) {
    return await getArticle(articleId)
  }

  const userId = context.userId
  if (!userId) {
    throw new ApiError(
      'UNAUTHENTICATED',
      `Unable to find an authentication context: ${context}`
    )
  }
  return await getArticleByUser(articleId, userId)
}

async function getArticle(articleId) {
  const article = await Article.findById(articleId)
    .populate('owner tags')
    .populate({ path: 'contributors', populate: { path: 'user' } })

  if (!article) {
    throw new ApiError(
      'NOT_FOUND',
      `Unable to find article with id ${articleId}`
    )
  }
  return article
}

async function getArticleByUser(articleId, userId) {
  const userWorkspace = await Workspace.findOne({
    'members.user': userId,
    articles: articleId,
  })

  if (userWorkspace) {
    // article found in one of user's workspaces
    const article = await Article.findById(articleId)
      .populate('owner tags')
      .populate({ path: 'contributors', populate: { path: 'user' } })

    if (!article) {
      throw new ApiError(
        'NOT_FOUND',
        `Unable to find article with id ${articleId}`
      )
    }
    return article
  }

  // find article by owner or contributors
  const article = await Article.findOne({
    _id: articleId,
    $or: [
      { owner: userId },
      { contributors: { $elemMatch: { user: userId } } },
    ],
  })
    .populate('owner tags')
    .populate({ path: 'contributors', populate: { path: 'user' } })

  if (!article) {
    throw new ApiError(
      'NOT_FOUND',
      `Unable to find article with id ${articleId}`
    )
  }
  return article
}

async function createVersion(article, { major, message, userId, type }) {
  const { bib, metadata, ydoc } = article.workingVersion

  const md = getTextFromYjsDoc(ydoc)

  /** @type {Query<Array<Article>>|Array<Article>} */
  const latestVersions = await Version.find({
    _id: { $in: article.versions.map((a) => a._id) },
  }).sort({ createdAt: -1 })

  if (latestVersions?.length > 0) {
    const latestVersion = latestVersions[0]
    if (
      bib === latestVersion.bib &&
      metadata === latestVersion.metadata &&
      md === latestVersion.md
    ) {
      logger.info("Won't create a new version since there's no change", {
        action: 'createVersion',
        articleId: article._id,
      })
      return false
    }
  }

  let mostRecentVersion = { version: 0, revision: 0 }
  const latestUserVersions = latestVersions?.filter(
    (v) => !v.type || v.type === 'userAction'
  )
  if (latestUserVersions?.length > 0) {
    const latestUserVersion = latestUserVersions[0]
    mostRecentVersion = {
      version: latestUserVersion.version,
      revision: latestUserVersion.revision,
    }
  }
  const { revision, version } = major
    ? computeMajorVersion(mostRecentVersion)
    : computeMinorVersion(mostRecentVersion)

  const createdVersion = await Version.create({
    md,
    metadata,
    bib,
    version,
    revision,
    message: message,
    owner: userId,
    type: type || 'userAction',
  })
  await createdVersion.populate('owner').execPopulate()
  article.versions.unshift(createdVersion._id)
  return true
}

module.exports = {
  Mutation: {
    /**
     * Create an article as the current user
     * @param {null} _root
     * @param {*} args
     * @param {{ userId, token }} context
     */
    async createArticle(_root, args, context) {
      const user = await getUser(context.userId)
      const { title, tags, workspaces } = args.createArticleInput

      //Add default article + default version
      const newArticle = await Article.create({
        title,
        owner: user,
        workingVersion: {
          md: '',
          bib: '',
          metadata: {},
        },
      })

      if (Array.isArray(tags) && tags.length) {
        await newArticle.addTags(...tags)
      }

      if (Array.isArray(workspaces) && workspaces.length) {
        for await (const id of workspaces) {
          const workspace = await Workspace.getWorkspaceById(id, user)
          workspace.articles.push(newArticle)
          await workspace.save()
        }
      }

      user.articles.push(newArticle)
      await user.save()
      return newArticle
    },

    async article(_root, { articleId }, context) {
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
    async shareArticle(_root, args, context) {
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
    async unshareArticle(_root, args, context) {
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
    async duplicateArticle(_root, args, context) {
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

      await Promise.all([newArticle.save(), withUser.save()])

      // Maintain links
      await Corpus.updateMany(
        { 'articles.article': article._id },
        { $push: { articles: { article: newArticle._id } } }
      )

      await Workspace.updateMany(
        { articles: article },
        { $push: { articles: [newArticle._id] } }
      )

      return newArticle
    },
  },

  Query: {
    /**
     * Fetch an article as the current user
     *
     * @param {null} _root
     * @param {{ article: string }} args
     * @param {{ loaders: { article }, userId, token }} context
     * @returns
     */
    async article(_root, args) {
      return await getArticle(args.article)
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
    async articles(_root, args, context) {
      const { userId } = isUser(args, context)
      return Article.getArticles({
        filter: {
          $or: [
            { owner: userId },
            { contributors: { $elemMatch: { user: userId } } },
          ],
        },
        loaders: context.loaders,
      })
    },
  },

  Article: {
    async workspaces(article, _, { user, token }) {
      if (token.admin) {
        return Workspace.find({ articles: article._id })
      }
      return Workspace.find({
        $and: [{ articles: article._id }, { 'members.user': user._id }],
      })
    },

    async removeContributor(article, { userId }) {
      const contributorUser = await getUser(userId)
      await article.unshareWith(contributorUser)
      return article
    },

    async addContributor(article, { userId }) {
      const contributorUser = await User.findById(userId)
      if (!contributorUser) {
        throw new Error(`Unable to find user with id: ${userId}`)
      }
      await article.shareWith(contributorUser)
      return article
    },

    async versions(article, _args, context) {
      const versions = (
        await Promise.all(
          article.versions.map(
            async (versionId) => await context.loaders.versions.load(versionId)
          )
        )
      ).filter((v) => v) // ignore unresolved versions
      versions.sort((a, b) => b.createdAt - a.createdAt)
      return versions
    },

    /**
     * Delete an article.
     *
     * @param {import('mongoose').Document} article
     * @returns
     */
    async delete(article) {
      await Workspace.updateMany(
        {},
        {
          $pull: {
            articles: article._id,
          },
        }
      )
      await article.remove()
      // TODO: remove versions associated with this article!
      return article.$isDeleted()
    },

    async rename(article, { title }) {
      article.set('title', title)
      const result = await article.save({ timestamps: false })
      return result === article
    },

    async setZoteroLink(article, { zotero }) {
      article.set('zoteroLink', zotero)
      const result = await article.save({ timestamps: false })
      return result === article
    },

    async addTags(article, { tags }) {
      await article.addTags(...tags)
      return article.tags
    },

    async removeTags(article, { tags }) {
      await article.removeTags(...tags)
      return article.tags
    },

    async setPreviewSettings(article, { settings }) {
      await article.set('preview', settings, { merge: true }).save()
      return article
    },

    async updateWorkingVersion(article, { content }) {
      Object.entries(content).forEach(([key, value]) =>
        article.set({
          workingVersion: {
            [key]: value,
          },
        })
      )

      return article.save()
    },

    /**
     * @param article
     * @param articleVersionInput
     * @param context
     * @return {Promise<Article>}
     */
    async createVersion(article, { articleVersionInput }) {
      const result = await createVersion(article, {
        ...articleVersionInput,
        type: 'userAction',
      })
      if (result === false) {
        throw new ApiError(
          'ILLEGAL_STATE',
          "Unable to create a new version since there's no change"
        )
      }
      await article.save()
      return article
    },
  },

  WorkingVersion: {
    md({ ydoc = '' }) {
      try {
        return getTextFromYjsDoc(ydoc)
      } catch (err) {
        Sentry.captureException(err)
        console.error(
          'Unable to load text content (Markdown) from the Y.js document on article',
          err
        )
        return ''
      }
    },
    bibPreview({ bib }) {
      return previewEntries(bib)
    },
    yaml({ metadata = {} }, { options }) {
      const legacyMetadata = toLegacyFormat(metadata)
      const yaml = YAML.dump(legacyMetadata)
      return options?.strip_markdown
        ? reformat(yaml, { replaceBibliography: false })
        : yaml
    },
  },
}
