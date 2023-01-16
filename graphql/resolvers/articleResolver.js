const defaultsData = require('../data/defaultsData')

const Article = require('../models/article')
const User = require('../models/user')
const Workspace = require('../models/workspace')

const isUser = require('../policies/isUser')
const { ApiError } = require('../helpers/errors')

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
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

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
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

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
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

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
      const userIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, userIds)

      //Fetch article and user to send to
      const fetchedArticle = await Article.findAndPopulateOneByOwners(args.article, [userId, userIds])

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
      const { userId } = isUser(args, context)

      if (context.token.admin === true) {
        const article = await Article
          .findById(args.article)
          .populate('owner tags')
          .populate({ path: 'versions', options: { sort: { createdAt: -1 } }, populate: { path: 'owner' } })
          .populate({ path: 'contributors', populate: { path: 'user' } });

        if (!article) {
          throw new ApiError('NOT_FOUND', `Unable to find article with id ${args.article}`)
        }

        return article
      }

      const userIds = await User.findAccountAccessUserIds(context.token._id)
      const article = await Article.findAndPopulateOneByOwners(args.article, [userId, userIds])

      if (!article) {
        throw new ApiError('NOT_FOUND', `Unable to find article with id ${args.article}`)
      }

      return article
    },

    /**
     * Fetch all the articles related to a user, given the logged in user has access to it
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async articles (_, args, context) {
      const { userId, fromSharedUserId } = isUser(args, context)

      if (fromSharedUserId) {
        const sharedUserIds = await User.findAccountAccessUserIds(userId)

        if (!sharedUserIds.includes(fromSharedUserId)) {
          throw new Error("Forbidden")
        }
      }

      return Article.findManyByOwner({ userId, fromSharedUserId })
    },
  },

  Article: {
    async workspaces (article, { user }) {
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
  }
}
