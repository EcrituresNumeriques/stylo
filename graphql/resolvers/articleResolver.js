const { getArticleById } = require('./nestedModel')

const defaultsData = require('../data/defaultsData')

const Article = require('../models/article');
const Version = require('../models/version');
const User = require('../models/user');
const Tag = require('../models/tag');

const isUser = require('../policies/isUser')
const isAdmin = require('../policies/isAdmin')

const populateArgs = require('../helpers/populateArgs')

const { populateArticle } = require('./nestedModel')

module.exports = {
  createArticle: async (args,{req}) => {
    //filter bad requests
    try{
      args = populateArgs(args,req)
      isUser(args,req)

      //fetch user
      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('This user does not exist')}

      //Add default article + default version
      const newArticle = new Article({
        title: args.title || defaultsData.title
      });

      thisUser.articles.push(newArticle)
      newArticle.owners.push(thisUser)

      const createdArticle = await newArticle.save();
      await thisUser.save();

      //Save the article and version ID in the req object, for other resolver to consum with "new" ID
      req.created = {...req.created, article:createdArticle.id}

      // TODO: filter owners vers ID
      createdArticle.owners = createdArticle.owners.map(o => o.id)
      return populateArticle(createdArticle)
    }
    catch(err){
      throw err
    }
  },

  updateWorkingVersion: async (args, {req}) => {
    const ALLOWED_PARAMS = ['bib', 'md', 'yaml']

    args = populateArgs(args,req)
    isUser(args,req)

    //fetch user
    const thisUser = await User.findOne({_id: args.user})
    if(!thisUser){throw new Error('This user does not exist')}

    //fetch article
    const fetchedArticle = await Article.findOne({_id: args.article}).populate('owners');
    if(!fetchedArticle){throw new Error('Wrong article ID')}

    if(!fetchedArticle.owners.map(u => u.id).includes(thisUser.id)){
      throw new Error('User has no right to push new version')
    }

    ALLOWED_PARAMS
      .filter(key => key in args)
      .forEach(key => fetchedArticle.workingVersion[key] = args[key])

    const returnArticle = await fetchedArticle.save()

    return populateArticle(returnArticle)
  },

  shareArticle: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //Fetch article and user to send to
      const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!fetchedArticle){throw new Error('Unable to find article')}
      const fetchedUser = await User.findOne({_id:args.to})
      if(!fetchedUser){throw new Error('Unable to find user')}

      //Check if user is not already in array
      if(fetchedArticle.owners.map(a => a.toString()).includes(fetchedUser.id)){ throw new Error('Article already shared with this user')}

      //Add user to list of owner
      fetchedArticle.owners.push(fetchedUser)
      fetchedUser.articles.push(fetchedArticle)

      const returnArticle = await fetchedArticle.save()
      await fetchedUser.save()

      return populateArticle(returnArticle)

    }
    catch(err){
      throw err
    }
  },
  sendArticle: async (args,{req}) => {
    try{

      populateArgs(args,req)
      isUser(args,req)

      //Fetch article and user to send to
      const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!fetchedArticle){throw new Error('Unable to find article')}
      const fetchedUser = await User.findOne({_id:args.to})
      if(!fetchedUser){throw new Error('Unable to find user')}

      if(!fetchedArticle){throw new Error('Unable to fetch version')}

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
      newArticle.owners.push(fetchedUser.id)
      fetchedUser.articles.push(newArticle)

      //Save the three objects
      const returnedArticle = await newArticle.save()
      await fetchedUser.save()

      return populateArticle(returnedArticle)

    }
    catch(err){
      throw err
    }

  },
  renameArticle: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //Fetch Article
      const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!fetchedArticle){throw new Error('Unable to find article')}

      //If all good, change title
      fetchedArticle.title = args.title
      const returnedArticle = await fetchedArticle.save()

      return populateArticle(returnedArticle)
    }
    catch(err){
      throw err
    }
  },
  zoteroArticle: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //Fetch Article
      const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!fetchedArticle){throw new Error('Unable to find article')}

      //If all good, change title
      fetchedArticle.zoteroLink = args.zotero
      const returnedArticle = await fetchedArticle.save()

      return populateArticle(returnedArticle)
    }
    catch(err){
      throw err
    }
  },
  deleteArticle: async (args, {req}) => {
    try{
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

      return populateArticle(returnedArticle)

    }
    catch(err){
      throw err
    }
  },
  article: async (args, { req }) => {
    const { article:articleId } = args
    const article = await Article.findOne({ _id: articleId, owners: { $in: req.user.usersIds } })

    if (!article) {
      throw new Error(`Unable to find this article : _id ${articleId} does not exist`)
    }

    return populateArticle(article)
  },
  articles: async (_,{req}) => {
    try{
      isAdmin(req);
      const articles = await Article.find();
      return articles.map(populateArticle)
    }
    catch(err){
      throw err
    }
  },
}
