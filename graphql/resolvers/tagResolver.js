const {populateTag, populateArticle, populateUser} = require('./nestedModel')

const User = require('../models/user');
const Tag = require('../models/tag');
const Article = require('../models/article');

const isUser = require('../policies/isUser')

const populateArgs = require('../helpers/populateArgs')

module.exports = {
  createTag: async (args,{req}) => {

    console.log("entering tag creation")
    //filter bad requests
    try{
      isUser(args,req)

      //fetch user
      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('This user does not exist')}

      //Add default article + default version
      const newTag = new Tag({name:args.name,description:args.description});
      
      thisUser.tags.push(newTag)
      newTag.owner = thisUser

      const createdTag = await newTag.save();
      await thisUser.save();

      //Save the tag ID in the req object, for other resolver to consum with "new" ID
      req.created = {...req.created,tag:createdTag.id}

      return populateTag(createdTag)
    }
    catch(err){
      throw err
    }

  },
  addToTag: async (args,{req}) => {
    try{
      args = populateArgs(args,req)
      isUser(args,req)

      //load article and tag
      const thisArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!thisArticle){throw new Error('Unable to find article')}      
      const thisTag = await Tag.findOne({_id:args.tag,owner:args.user})
      if(!thisTag){throw new Error('Unable to find tag')}

      //Check if not already inside tag
      if(thisArticle.tags.map(t => t.toString()).includes(thisTag.id)){throw new Error('Article already tagged')}
      if(thisTag.articles.map(a => a.toString()).includes(thisArticle.id)){throw new Error('Tag already set for article')}

      //if user owns tag + article, push each in the other
      //console.log(thisArticle)
      //console.log(thisTag)
      thisArticle.tags.push(thisTag)
      thisTag.articles.push(thisArticle)

      //saving
      const returnArticle = await thisArticle.save()
      await thisTag.save()
      
      return populateArticle(returnArticle)
    }
    catch(err){
      throw err
    }
  },
  removeFromTag: async (args,{req}) => {
    try{
      args = populateArgs(args,req)
      isUser(args,req)

      //load article and tag
      const thisArticle = await Article.findOne({_id:args.article,owners:args.user})
      if(!thisArticle){throw new Error('Unable to find article')}      
      const thisTag = await Tag.findOne({_id:args.tag,owner:args.user})
      if(!thisTag){throw new Error('Unable to find tag')}

      //Check if already inside tag
      if(!thisArticle.tags.map(t => t.toString()).includes(thisTag.id)){throw new Error('Article not tagged')}
      if(!thisTag.articles.map(a => a.toString()).includes(thisArticle.id)){throw new Error('Tag not set for article')}

      //if user owns tag + article, push each in the other
      //console.log(thisArticle)
      //console.log(thisTag)
      thisArticle.tags.pull(thisTag)
      thisTag.articles.pull(thisArticle)

      //saving
      const returnArticle = await thisArticle.save()
      await thisTag.save()
      
      return populateArticle(returnArticle)
    }
    catch(err){
      throw err
    }
  },
  deleteTag: async (args,{req}) => {
    try{
      populateArgs(args,req)
      isUser(args,req)

      //Recover tag, and all articles
      const thisTag = await Tag.findOne({_id:args.tag,owner:args.user})
      if(!thisTag){throw new Error('Unable to find tag')}

      //fetch user
      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('This user does not exist')}

      //pull tags from user and article + remove tag
      thisUser.tags.pull(args.tag)
      await Article.updateMany({tags:args.tag},{$pull:{tags:args.tag}})
      await Tag.findOneAndRemove({_id:args.tag})
      const returnUser = await thisUser.save()

      return populateUser(returnUser)
    }
    catch(err){
      throw err
    }
  },

}
