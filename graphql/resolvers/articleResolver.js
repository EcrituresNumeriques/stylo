const defaultsData = require('../data/defaultsData')

const Article = require('../models/article');
const User = require('../models/user');

const isUser = require('../policies/isUser')
const { ApiError } = require('../helpers/errors');

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
      const newArticle = new Article({
        title: args.title || defaultsData.title,
        owner: user,
        workingVersion: {
          md: defaultsData.md,
          bib: defaultsData.bib,
          yaml: defaultsData.yaml,
        }
      });

      await newArticle.save()

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
      const fetchedArticle = await Article
        .findOne({ _id: args.article, owner: { $in: allowedIds.concat([userId]) } })
        .populate({ path: 'contributors', populate: 'user' })

      if(!fetchedArticle){
        throw new Error('Unable to find article')
      }
      const fetchedUser = await User.findById(args.to)
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      //Check if user is not already in array
      if(fetchedArticle.contributors.find(({ user }) => user.id === fetchedUser.id)){
        throw new Error('Article already shared with this user')
      }

      //Add user to list of owner
      fetchedArticle.contributors.push({ user: fetchedUser, roles: ['read', 'write']})

      const [ returnArticle ] = await Promise.all([
        fetchedArticle.save({ timestamps: false }),
        fetchedUser.save({ timestamps: false })
      ])

      return returnArticle
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
      const { userId } = isUser(args, context)

      //Fetch article and user to send to
      const fetchedArticle = await Article
        .findOne({ _id: args.article, owner: { $in: allowedIds.concat([userId]) } })
        .populate({ path: 'contributors', populate: 'user' })

      if(!fetchedArticle){
        throw new Error('Unable to find article')
      }

      const fetchedUser = await User.findById(args.to)
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      //Remove article from owner "user" etc.
      fetchedArticle.contributors = fetchedArticle.contributors.filter(({ user }) => user.id !== fetchedUser.id)
      fetchedUser.articles.pull(args.article)

      const returnArticle = await fetchedArticle.save({ timestamps: false })
      await fetchedUser.save({ timestamps: false })

      return returnArticle
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
      await newArticle.save()
      await fetchedUser.save()

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
      article.title = title
      const result = await article.save({ timestamps: false })

      return result === article
    },

    async setZoteroLink (article, { zotero }) {
      article.zoteroLink = zotero
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

    async updateWorkingVersion (article, { content }) {
      Object.entries(content)
        .forEach(([key, value]) => article.workingVersion[key] = value)

      const result = await article.save()

      return result === article
    }
  }
}
