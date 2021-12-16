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
    newArticle.owners.push(thisUser)

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

    const userIds = await User.findAccountAccessUserIds(args.user)

    //fetch article
    const fetchedArticle = await Article.findOne({
      _id: args.article,
      owners: { $in: [args.user, ...userIds] }
    });

    if(!fetchedArticle){
      throw new Error('Wrong article ID')
    }

    ALLOWED_PARAMS
      .filter(key => key in args)
      .forEach(key => fetchedArticle.workingVersion[key] = args[key])

    return fetchedArticle.save()
  },

  shareArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch article and user to send to
    const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
    if(!fetchedArticle){
      throw new Error('Unable to find article')
    }
    const fetchedUser = await User.findOne({_id:args.to})
    if(!fetchedUser){
      throw new Error('Unable to find user')
    }

    //Check if user is not already in array
    if(fetchedArticle.owners.map(a => a.toString()).includes(fetchedUser.id)){
      throw new Error('Article already shared with this user')
    }

    //Add user to list of owner
    fetchedArticle.owners.push(fetchedUser)
    fetchedUser.articles.push(fetchedArticle)

    const returnArticle = await fetchedArticle.save()
    await fetchedUser.save()

    return returnArticle
  },

  unshareArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch article and user to send to
    const fetchedArticle = await Article.findOne({ _id: args.article, owners: { $in: args.user } })
    if(!fetchedArticle){
      throw new Error('Unable to find article')
    }

    const fetchedUser = await User.findOne({_id:args.to})
    if(!fetchedUser){
      throw new Error('Unable to find user')
    }

    //Remove article from owner "user" etc.
    fetchedArticle.owners.pull(args.to)
    fetchedUser.articles.pull(args.article)

    const returnArticle = await fetchedArticle.save()
    await fetchedUser.save()

    return returnArticle
  },
  duplicateArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch article and user to send to
    const userIds = await User.findAccountAccessUserIds(req.user._id)
    const fetchedArticle = await Article.findOneByOwners(args.article, [req.user._id, userIds])

    if(!fetchedArticle){
      throw new Error('Unable to find article')
    }
    const fetchedUser = await User.findOne({_id:args.to})
    if(!fetchedUser){
      throw new Error('Unable to find user')
    }

    //All good, create new Article & merge version/article/user
    const prefix = args.user === args.to ? '[Copy] ' : '[Sent] '

    const newArticle = new Article({
      ...fetchedArticle,
      _id: undefined,
      owners: [fetchedUser.id],
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
    const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
    if(!fetchedArticle){throw new Error('Unable to find article')}

    //If all good, change title
    fetchedArticle.title = args.title
    return fetchedArticle.save()
  },
  zoteroArticle: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch Article
    const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
    if(!fetchedArticle){throw new Error('Unable to find article')}

    //If all good, change title
    fetchedArticle.zoteroLink = args.zotero
    return fetchedArticle.save()
  },
  deleteArticle: async (args, {req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //Fetch article
    let fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
    if(!fetchedArticle){throw new Error('Unable to find article')}

    //fetch User
    const fetchedUser = await User.findOne({_id:args.user})
    if(!fetchedUser){throw new Error('Unable to find user')}


    //if all good remove user from owners
    fetchedArticle.owners.pull(args.user)
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

    isUser(args, req)

    const userIds = await User.findAccountAccessUserIds(req.user._id)
    const article = await Article.findOneByOwners(articleId, [req.user._id, userIds])

    if (!article) {
      throw new Error(`Unable to find this article : _id ${articleId} does not exist`)
    }

    return article
  },
  articles: async (_, {req}) => {
    isAdmin(req)

    return Article.find().populate('owners versions tags')
  },
}
