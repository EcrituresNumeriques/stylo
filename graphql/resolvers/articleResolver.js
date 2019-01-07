const { getArticleById } = require('./nestedModel')

const defaultsData = require('../data/defaultsData')

const Article = require('../models/article');
const Version = require('../models/version');
const User = require('../models/user');

const isUser = require('../policies/isUser')

const { populateArticle } = require('./nestedModel')

module.exports = {
  createArticle: async (args,req) => {

    //filter bad requests
    try{
      isUser(args,req)

      //fetch user
      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('This user does not exist')}

      //Add default article + default version
      const newArticle = new Article({title:args.title || defaultsData.title});
      const newVersion = new Version({md:defaultsData.md,yaml:defaultsData.yaml,bib:'',sommaire:defaultsData.sommaire});
      newArticle.versions.push(newVersion)
      newVersion.article = newArticle

      thisUser.articles.push(newArticle)
      newArticle.owners.push(thisUser)

      const createdArticle = await newArticle.save();
      await newVersion.save();
      await thisUser.save();


      return populateArticle(createdArticle)
    }
    catch(err){
      throw err
    }

  },
  article: async (args) => {
    try{
      return await getArticleById(args.article)
    }
    catch(err){
      throw err
    }
  }
}
