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
      const newVersion = new Version({md:defaultsData.md,yaml:thisUser.yaml || defaultsData.yaml,bib:'',sommaire:defaultsData.sommaire,message:defaultsData.message});
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
  shareArticle: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //Fetch article and user to send to
      const fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!fetchedArticle){throw new Error('Unable to find article')}
      const fetchedUser = await User.findOne({_id:args.to})
      if(!fetchedUser){throw new Error('Unable to find user')}

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

      let fetchedVersion
      if(args.version){
        fetchedVersion = await Version.findOne({_id:args.version,article:args.article})
      }
      else {
        fetchedVersion = await Version.findOne({_id:fetchedArticle.versions[fetchedArticle.versions.length-1].toString()})
      }
      if(!fetchedArticle){throw new Error('Unable to fetch version')}

      //clone version

      let newVersion = new Version({
        md:fetchedVersion.md,
        sommaire:fetchedVersion.sommaire,
        yaml:fetchedVersion.yaml,
        bib:fetchedVersion.bib
      });
      //All good, create new Article & merge version/article/user
      let newArticle = new Article({title:'[Sent] '+fetchedArticle.title})
      newArticle.owners.push(fetchedUser.id)
      newArticle.versions.push(newVersion)
      fetchedUser.articles.push(newArticle)
      newVersion.owner = fetchedUser

      //Save the three objects
      const returnedArticle = await newArticle.save()
      await fetchedUser.save()
      await newVersion.save()

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
  deleteArticle: async (args, {req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //Fetch article
      let fetchedArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!fetchedArticle){throw new Error('Unable to find article')}

      //if all good remove user from owners
      fetchedArticle.owners.pull(args.user)

      //save
      const returnedArticle = await fetchedArticle.save()

      return populateArticle(returnedArticle)

    }
    catch(err){
      throw err
    }
  },
  article: async (args,{req}) => {

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
