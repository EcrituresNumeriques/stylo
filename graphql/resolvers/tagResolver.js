const {populateTag} = require('./nestedModel')

const User = require('../models/user');
const Tag = require('../models/tag');

const isUser = require('../policies/isUser')

module.exports = {
  createTag: async (args,req) => {

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

      console.log(populateTag(createdTag))
      return populateTag(createdTag)
    }
    catch(err){
      throw err
    }

  }
}
