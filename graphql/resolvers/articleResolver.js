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
    async createArticle (_, args, { user }) {
      //filter bad requests
      const allowedIds = await User.findAccountAccessUserIds(user._id)
      isUser(args, { user }, allowedIds)

      //fetch user
      const thisUser = await User.findOne({ _id: args.user })

      if(!thisUser){
        throw new Error('This user does not exist')
      }

      //Add default article + default version
      const newArticle = new Article({
        title: args.title || defaultsData.title,
        workingVersion: {
          md: defaultsData.md,
          bib: defaultsData.bib,
          yaml: defaultsData.yaml,
        }
      });

      thisUser.articles.push(newArticle)
      newArticle.owner = thisUser

      const createdArticle = await newArticle.save();
      await thisUser.save();

      return createdArticle
    },

    /**
     * Update article as the loggeed in user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async updateWorkingVersion (_, args, { user }) {
      const ALLOWED_PARAMS = ['bib', 'md', 'yaml']

      isUser(args, { user })

      //fetch user
      const thisUser = await User.findOne({_id: args.user})
      if(!thisUser){
        throw new Error('This user does not exist')
      }

      //fetch article
      const userIds = await User.findAccountAccessUserIds(user._id)
      const fetchedArticle = await Article.findAndPopulateOneByOwners(args.article, [user._id, userIds])

      if(!fetchedArticle){
        throw new Error('Wrong article ID')
      }

      ALLOWED_PARAMS
        .filter(key => key in args)
        .forEach(key => fetchedArticle.workingVersion[key] = args[key])

      return fetchedArticle.save()
    },

    /**
     * Share an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async shareArticle (_, args, { user }) {
      const allowedIds = await User.findAccountAccessUserIds(user._id)
      isUser(args, { user }, allowedIds)

      //Fetch article and user to send to
      const fetchedArticle = await Article
        .findOne({ _id: args.article, owner: { $in: allowedIds.concat([args.user]) } })
        .populate({ path: 'contributors', populate: 'user' })

      if(!fetchedArticle){
        throw new Error('Unable to find article')
      }
      const fetchedUser = await User.findOne({ _id: args.to })
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      //Check if user is not already in array
      if(fetchedArticle.contributors.find(({ user }) => user.id === fetchedUser.id)){
        throw new Error('Article already shared with this user')
      }

      //Add user to list of owner
      fetchedArticle.contributors.push({ user: fetchedUser, roles: ['read', 'write']})

      const returnArticle = await fetchedArticle.save()
      await fetchedUser.save({ timestamps: false })

      return returnArticle
    },

    /**
     * Unshare an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async unshareArticle (_, args, { user }) {
      const allowedIds = await User.findAccountAccessUserIds(user._id)
      isUser(args, { user })

      //Fetch article and user to send to
      const fetchedArticle = await Article
        .findOne({ _id: args.article, owner: { $in: allowedIds.concat([args.user]) } })
        .populate({ path: 'contributors', populate: 'user' })

      if(!fetchedArticle){
        throw new Error('Unable to find article')
      }

      const fetchedUser = await User.findOne({_id:args.to})
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      //Remove article from owner "user" etc.
      fetchedArticle.contributors = fetchedArticle.contributors.filter(({ user }) => user.id !== fetchedUser.id)
      fetchedUser.articles.pull(args.article)

      const returnArticle = await fetchedArticle.save()
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
      const userIds = await User.findAccountAccessUserIds(context.user._id)
      isUser(args, context, userIds)

      //Fetch article and user to send to
      const fetchedArticle = await Article.findAndPopulateOneByOwners(args.article, [context.user._id, userIds])

      if(!fetchedArticle){
        throw new Error('Unable to find article')
      }
      const fetchedUser = await User.findOne({ _id: args.to })
      if(!fetchedUser){
        throw new Error('Unable to find user')
      }

      //All good, create new Article & merge version/article/user
      const prefix = args.user === args.to ? '[Copy] ' : '[Sent] '

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
      const returnedArticle = await newArticle.save()
      await fetchedUser.save()

      return returnedArticle
    },
    /**
     * Rename an article as the current user
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async renameArticle (_, args, context) {
      const allowedIds = await User.findAccountAccessUserIds(context.user._id)
      isUser(args, context, allowedIds)

      //Fetch Article
      const { article: _id, user } = args
      const fetchedArticle = await Article.findOneByOwner({ _id, user })
      if(!fetchedArticle){throw new Error('Unable to find article')}

      //If all good, change title
      fetchedArticle.title = args.title
      return fetchedArticle.save({ timestamps: false })
    },
    /**
     * Link an article with the logged in user collection
     * Warning: untested with the shared account system
     *
     * @param {*} args
     * @param {*} param1
     * @returns
     */
    async zoteroArticle (_, args, context) {
      isUser(args, context)

      //Fetch Article
      const { article: _id, user } = args
      const fetchedArticle = await Article.findOneByOwner({ _id, user })
      if(!fetchedArticle){throw new Error('Unable to find article')}

      //If all good, change title
      fetchedArticle.zoteroLink = args.zotero
      return fetchedArticle.save({ timestamps: false })
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
    async article (_, { article: articleId }, { user }) {
      if (user?.admin === true) {
        const article = await Article
          .findById(articleId)
          .populate('owner tags')
          .populate({ path: 'versions', options: { sort: { createdAt: -1 } }, populate: { path: 'owner' } })
          .populate({ path: 'contributors', populate: { path: 'user' } });

        if (!article) {
          throw new ApiError('NOT_FOUND', `Unable to find article with id ${articleId}`)
        }

        return article
      }

      const userId = String(user?._id)
      const userIds = await User.findAccountAccessUserIds(userId)
      const article = await Article.findAndPopulateOneByOwners(articleId, [userId, userIds])

      if (!article) {
        throw new ApiError('NOT_FOUND', `Unable to find article with id ${articleId}`)
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
    async articles (_, args, { user }) {
      // if the userId is not provided
      // we assume it is the user from the token
      // otherwise, it is expected we request articles from a shared account
      args.user = ('user' in args) === false && user ? String(user._id) : args.user

      const fromSharedUserId = args.user !== user?._id ? args.user : null
      const userId = String(user?._id)

      if (fromSharedUserId) {
        const sharedUserIds = await User.findAccountAccessUserIds(userId)

        if (!sharedUserIds.includes(fromSharedUserId)) {
          throw new Error("Forbidden")
        }
      }
      else {
        isUser(args, { user })
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

    async addTags (article, { tags }) {
      await article.addTags(...tags)

      return article.tags
    },

    async removeTags (article, { tags }) {
      await article.removeTags(...tags)

      return article.tags
    },
  }
}
