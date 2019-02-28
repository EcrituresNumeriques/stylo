const Version = require('../models/version');
const Article = require('../models/article');
const User = require('../models/user');

const isUser = require('../policies/isUser')

const { populateVersion, getVersionById } = require('./nestedModel')

const populateArgs = require('../helpers/populateArgs')

module.exports = {
  saveVersion: async (args,{req}) => {

    //filter bad requests
    try{
      args = populateArgs(args,req)
      isUser(args,req)


      //fetch user
      const thisUser = await User.findOne({_id:args.user})
      if(!thisUser){throw new Error('This user does not exist')}

      //fetch article
      const articleToSaveInto = await Article.findOne({_id:args.version.article}).populate('versions owners');
      if(!articleToSaveInto){throw new Error('Wrong article ID')}

      if(!articleToSaveInto.owners.map(u => u.id).includes(thisUser.id)){
        throw new Error('User has no right to push new version')
      }

      const lastVersion = articleToSaveInto.versions[articleToSaveInto.versions.length-1]
      let values = {...lastVersion._doc}
      if(args.version.md){
        values = {...values, md:args.version.md}
        values = {...values, sommaire:args.version.md.split('\n').filter((line) => (line.match(/^#+\ /))).join('\n')}
      }
      if(args.version.yaml){
        values = {...values, yaml:args.version.yaml}
      }
      if(args.version.bib){
        values = {...values, bib:args.version.bib}
      }

      delete values.createdAt
      delete values.updatedAt

      let returnedVersion;

      //console.log(values)

      if(args.version.auto && lastVersion.autosave && lastVersion.owner == thisUser.id){
          //Updating last autosave
          returnedVersion = await Version.findOneAndUpdate({_id:values._id},{$set:{...values}})
      }
      else{
        //full save, add new record
        delete values._id

        //Add major or not + set autosave status
        if(!args.version.auto){
          if(args.version.major){values.version++;values.revision=0}
          else{values.revision++}
          values.autosave = false
        }
        else{
          values.autosave = true
        }

        returnedVersion = await Version.create({...values})
        articleToSaveInto.versions.push(returnedVersion)
        await articleToSaveInto.save()
      }

      //console.log(returnedVersion)
      
      return populateVersion(returnedVersion)
     
     
    }
    catch(err){
      throw err
    }

  },
  version: async (args,{req}) => {

    // TODO need to make sure user should have access to this version 

    try{
      return await getVersionById(args.version)
    }
    catch(err){
      throw err
    }
  }
}
