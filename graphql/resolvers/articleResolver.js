const defaultsData = require('../data/defaultsData')

const Article = require('../models/article');
const User = require('../models/user');
const Tag = require('../models/tag');

const isUser = require('../policies/isUser')
const isAdmin = require('../policies/isAdmin')

const populateArgs = require('../helpers/populateArgs')

module.exports = {
  createArticle: async (args,{req}) => {
  //filter bad requests
    args = populateArgs(args,req)
    isUser(args,req)

    //fetch user
    const thisUser = await User.findOne({_id:args.user})
    if(!thisUser){throw new Error('This user does not exist')}

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

    //Save the article and version ID in the req object, for other resolver to consum with "new" ID
    req.created = {...req.created, article:createdArticle.id}

    return createdArticle
  },

  updateWorkingVersion: async (args, {req}) => {
    const ALLOWED_PARAMS = ['bib', 'md', 'yaml']

    args = populateArgs(args,req)
    isUser(args,req)

    //fetch user
    const thisUser = await User.findOne({_id: args.user})
    if(!thisUser){
      throw new Error('This user does not exist')
    }

    //fetch article
    const userIds = await User.findAccountAccessUserIds(args.user)
    const fetchedArticle = await Article.findAndPopulateOneByOwners(args.article, [req.user._id, userIds])

    if(!fetchedArticle){
      throw new Error('Wrong article ID')
    }

    ALLOWED_PARAMS
      .filter(key => key in args)
      .forEach(key => fetchedArticle.workingVersion[key] = args[key])

    return fetchedArticle.save()
  },

  shareArticle: async (args, {req}) => {
    populateArgs(args, req)
    isUser(args, req)

    //Fetch article and user to send to
    const fetchedArticle = await Article
      .findOne({ _id: args.article, owner: args.user })
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

  unshareArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch article and user to send to
    const { article: _id, user } = args
    const fetchedArticle = await Article.findOneByOwner({ _id, user })

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
  duplicateArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch article and user to send to
    const userIds = await User.findAccountAccessUserIds(req.user._id)
    const fetchedArticle = await Article.findAndPopulateOneByOwners(args.article, [req.user._id, userIds])

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
  renameArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch Article
    const { article: _id, user } = args
    const fetchedArticle = await Article.findOneByOwner({ _id, user })
    if(!fetchedArticle){throw new Error('Unable to find article')}

    //If all good, change title
    fetchedArticle.title = args.title
    return fetchedArticle.save({ timestamps: false })
  },
  zoteroArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch Article
    const { article: _id, user } = args
    const fetchedArticle = await Article.findOneByOwner({ _id, user })
    if(!fetchedArticle){throw new Error('Unable to find article')}

    //If all good, change title
    fetchedArticle.zoteroLink = args.zotero
    return fetchedArticle.save({ timestamps: false })
  },
  deleteArticle: async (args, {req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch article
    const { article: _id, user } = args
    const fetchedArticle = await Article.findOneByOwner({ _id, user })
    if(!fetchedArticle){throw new Error('Unable to find article')}

    //fetch User
    const fetchedUser = await User.findOne({_id:args.user})
    if(!fetchedUser){throw new Error('Unable to find user')}


    //if all good remove user from owners
    fetchedArticle.owner = null
    fetchedArticle.contributors = []
    fetchedUser.articles.pull(args.article)

    //Remove from all of user's tag
    await Tag.updateMany({owner:fetchedUser.id},{$pull: {articles:fetchedArticle.id}},{safe:true})

    //save
    const returnedArticle = await fetchedArticle.save()
    await fetchedUser.save()

    return returnedArticle
  },
  article: async (args, { req }) => {
    const { article:articleId } = args

    if (req.user.admin === true) {
      return Article
        .findById(articleId)
        .populate('owner tags')
        .populate({ path: 'versions', populate: { path: 'owner' } })
        .populate({ path: 'contributors', populate: { path: 'user' } })
    }

    const userIds = await User.findAccountAccessUserIds(req.user._id)
    const article = await Article.findAndPopulateOneByOwners(articleId, [req.user._id, userIds])

    if (!article) {
      throw new Error(`Unable to find this article : _id ${articleId} does not exist`)
    }

    return article
  },

  articles: async (args, {req}) => {
    // if the userId is not provided
    // we assume it is the user from the token
    // otherwise, it is expected we request articles from a shared account
    args.user = ('user' in args) === false && req.user ? String(req.user._id) : args.user

    const fromSharedUserId = args.user !== req.user._id ? args.user : null
    const userId = req.user._id.toString()

    if (fromSharedUserId) {
      const sharedUserIds = await User.findAccountAccessUserIds(req.user._id)

      if (!sharedUserIds.includes(fromSharedUserId)) {
        throw new Error("Forbidden")
      }
    }
    else {
      isUser(args, req)
    }

    return Article.findManyByOwner({ userId, fromSharedUserId })
  },
}
