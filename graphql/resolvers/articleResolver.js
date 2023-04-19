const defaultsData = require('../data/defaultsData')

const Article = require('../models/article')
const User = require('../models/user')
const Workspace = require('../models/workspace')

const isUser = require('../policies/isUser')
const { ApiError } = require('../helpers/errors')
const { reformat } = require('../helpers/metadata.js')
const { logElapsedTime } = require('../helpers/performance')

module.exports = {
  Mutation: {
    /**
     * Create an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async createArticle (_, args, context) {
      //filter bad requests
      const { userId } = isUser(args, context)

      //fetch user
      const user = await User.findById(userId)

      if(!user){
        throw new Error('This user does not exist')
      }

      //Add default article + default version
      const newArticle = await Article.create({
        title: args.title || defaultsData.title,
        owner: user,
        workingVersion: {
          md: defaultsData.md,
          bib: defaultsData.bib,
          yaml: defaultsData.yaml,
        }
      });

      user.articles.push(newArticle)
      await user.save()

      return newArticle
    },

    /**
     * Share an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async shareArticle (_, args, context) {
      const { userId } = isUser(args, context)

      //Fetch article and user to send to
      const article = await Article.findOneByOwner({ _id: args.article, user: userId })

      if(!article){
        throw new Error('Unable to find article')
      }
      const fetchedUser = await User.findById(args.to)
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      await article.shareWith(fetchedUser)

      return article
    },

    /**
     * Unshare an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async unshareArticle (_, args, context) {
      const { userId } = isUser(args, context)

      //Fetch article and user to send to
      const article = await Article.findOneByOwner({ _id: args.article, user: userId })

      if(!article){
        throw new Error('Unable to find article')
      }

      const fetchedUser = await User.findById(args.to)
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      await article.unshareWith(fetchedUser)

      return article
    },
    /**
     * Duplicate an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async duplicateArticle (_, args, context) {
      const { userId } = isUser(args, context)

      //Fetch article and user to send to
      const fetchedArticle = await Article.findAndPopulateOneByOwners(args.article, context.user)

      if(!fetchedArticle){
        throw new Error('Unable to find article')
      }
      const fetchedUser = await User.findById(args.to)
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      //All good, create new Article & merge version/article/user
      const prefix = userId === args.to ? '[Copy] ' : '[Sent] '

      const newArticle = new Article({
        ...fetchedArticle.toObject(),
        _id: undefined,
        owner: fetchedUser.id,
        contributors: [],
        versions: [],
        createdAt: null,
        updatedAt: null,
        title: prefix + fetchedArticle.title,
      })

      newArticle.isNew = true
      fetchedUser.articles.push(newArticle)

      //Save the three objects
      await Promise.all([
        newArticle.save(),
        fetchedUser.save()
      ])

      return newArticle
    },
  },

  Query: {
    /**
     * Fetch an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async article (_, args, context) {
      isUser(args, context)

      if (context.token.admin === true) {
        const article = await Article
          .findById(args.article)
          .populate('owner tags')
          .populate({ path: 'contributors', populate: { path: 'user' } });

        if (!article) {
          throw new ApiError('NOT_FOUND', `Unable to find article with id ${args.article}`)
        }

        return article
      }

      const article = await Article.findAndPopulateOneByOwners(args.article, context.user)

      if (!article) {
        throw new ApiError('NOT_FOUND', `Unable to find article with id ${args.article}`)
      }

      return article
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
     * @param {null} _
     * @param {{ user?: String }} args
     * @param {{ user: User, token: Object, userId: String }} context
     * @returns {Promise<Article[]>}
     */
    async articles (_, args, context) {
      const { userId, fromSharedUserId } = isUser(args, context)
      return logElapsedTime(() => Article.findManyByOwner({ userId, fromSharedUserId }), 'findManyByOwner')
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
      const contributorUser = await User.findById(userId)
      if (!contributorUser) {
        throw new Error(`Unable to find user with id: ${userId}`)
      }
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

    async tags(article) {
      if (article.populated('tags')) {
        return article.tags
      }
      await article.populate('tags').execPopulate()
      return article.tags
    },

    async versions (article, { limit }) {
      await article
        .populate({
          path: 'versions',
          populate: { path: 'owner' },
          options: {
            limit,
            sort: { createdAt: -1 }
          }
        })
        .execPopulate()
      return article.versions
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
