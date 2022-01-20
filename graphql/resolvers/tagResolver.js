const User = require('../models/user');
const Tag = require('../models/tag');
const Article = require('../models/article');

const isUser = require('../policies/isUser')

const populateArgs = require('../helpers/populateArgs')

module.exports = {
  createTag: async (args,{req}) => {

    isUser(args,req)

    //fetch user
    const thisUser = await User.findOne({_id:args.user})
    if(!thisUser){
      throw new Error('This user does not exist')
    }

    //Add default article + default version
    const newTag = new Tag({name:args.name,description:args.description});

    thisUser.tags.push(newTag)
    newTag.owner = thisUser

    const createdTag = await newTag.save();
    await thisUser.save();

    //Save the tag ID in the req object, for other resolver to consum with "new" ID
    req.created = {...req.created,tag:createdTag.id}

    return createdTag
  },
  addToTag: async (args,{req}) => {
    args = populateArgs(args,req)
    isUser(args,req)

    //load article and tag
    const { article: _id, user } = args
    const fetchedArticle = await Article.findOneByOwner({ _id, user })
    if(!fetchedArticle){
      throw new Error('Unable to find article')
    }
    const thisTag = await Tag.findOne({_id:args.tag,owner:args.user})
    if(!thisTag){
      throw new Error('Unable to find tag')
    }

    //Check if not already inside tag
    if(fetchedArticle.tags.map(t => t.toString()).includes(thisTag.id)){throw new Error('Article already tagged')}
    if(thisTag.articles.map(a => a.toString()).includes(fetchedArticle.id)){throw new Error('Tag already set for article')}

    //if user owns tag + article, push each in the other
    fetchedArticle.tags.push(thisTag)
    thisTag.articles.push(fetchedArticle)

    //saving
    const returnArticle = await fetchedArticle.save()
    await thisTag.save()

    return returnArticle
  },
  removeFromTag: async (args,{req}) => {
    args = populateArgs(args,req)
    isUser(args,req)

    //load article and tag
    const { article: _id, user } = args
    const fetchedArticle = await Article.findOneByOwner({ _id, user })

    if(!fetchedArticle){throw new Error('Unable to find article')}

    const thisTag = await Tag.findOne({_id:args.tag,owner:args.user})
    if(!thisTag){throw new Error('Unable to find tag')}

    //Check if already inside tag
    if(!fetchedArticle.tags.map(t => t.toString()).includes(thisTag.id)){throw new Error('Article not tagged')}
    if(!thisTag.articles.map(a => a.toString()).includes(fetchedArticle.id)){throw new Error('Tag not set for article')}

    //if user owns tag + article, push each in the other
    fetchedArticle.tags.pull(thisTag)
    thisTag.articles.pull(fetchedArticle)

    //saving
    const returnArticle = await fetchedArticle.save()
    await thisTag.save()

    return returnArticle
  },
  deleteTag: async (args,{req}) => {
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

    return returnUser
  },
  updateTag: async (args,{req}) => {
    populateArgs(args,req)
    isUser(args,req)

    const thisTag = await Tag.findOne({ _id:args.tag, owner:args.user })
    if(!thisTag){
      throw new Error('Unable to find tag')
    }

    if(args.name){
      thisTag.name = args.name
    }
    if(args.description){
      thisTag.description = args.description
    }
    if(args.color){
      thisTag.color = args.color
    }

    return thisTag.save()
  },

  tag: async (args, {req}) => {
    isUser(args,req)

    return Tag
      .findOne({ _id: args.tag })
      .populate({ path: 'articles', populate: { path: 'versions' } })
  },

  tags: async (args, {req}) => {
    isUser(args,req)

    return Tag
      .find({ owner: args.user })
      .populate({ path: 'articles', populate: { path: 'versions' } })
  },
}
