const { getArticleById } = require('./nestedModel')

const defaultsData = require('../data/defaultsData')

const Article = require('../models/article');
const Version = require('../models/version');
const User = require('../models/user');

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
      const newArticle = new Article({title:args.title || defaultsData.title});
      const newVersion = new Version({md:defaultsData.md,yaml:thisUser.yaml || defaultsData.yaml,bib:'',sommaire:defaultsData.sommaire});
      newArticle.versions.push(newVersion)
      newVersion.article = newArticle

      thisUser.articles.push(newArticle)
      newArticle.owners.push(thisUser)

      const createdArticle = await newArticle.save();
      await newVersion.save();
      await thisUser.save();

      //Save the article and version ID in the req object, for other resolver to consum with "new" ID
      req.created = {...req.created,article:createdArticle.id,version:newVersion.id}

      // TODO: filter owners vers ID
      createdArticle.owners = createdArticle.owners.map(o => o.id)
      return populateArticle(createdArticle)
    }
    catch(err){
      throw err
    }

  },
  article: async (args) => {

    // -------------------------------------------
    // TODO: verify user has acces to this article
    // -------------------------------------------

    try{
      return await getArticleById(args.article)
    }
    catch(err){
      throw err
    }
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
