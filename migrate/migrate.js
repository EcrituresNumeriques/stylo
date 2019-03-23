const articles = require('./data/articles.json')
const users = require('./data/users.json')
const user_credentials = require('./data/user_credentials.json')
const versions = require('./data/versions.json')

const User = require('./models/user');
const Password = require('./models/user_password');
const Token = require('./models/user_token');
const Tag = require('./models/tag');
const Article = require('./models/article');
const Version = require('./models/version');


module.exports = async () => {
  console.log(`${articles.length} articles, ${versions.length} versions, ${users.length} users, ${user_credentials.length} passwords`)



  //displayName
  let displayNameList = []

  //Username
  let usernameList = []

  //email
  let emailList = []


  try{

    // insert articles, VERSIONS + ZOTEROLINK missing

    const articlesToUpdate = articles.filter(a=>a.title).map(a=>{
      console.log(`importing article ${a.title}`)
      return {...a,_id:a._id['$oid'],owners:a.owner}
    })
    const insertedArticles = await Article.insertMany(articlesToUpdate)
    if(!insertedArticles){
     return false
    }

    // insert users, linking seems ok
    const userToUpdate = users.filter(u=>true).reverse().map((u,i)=>{
      if(displayNameList.includes(u.displayName)){
        u.displayName = u.displayName+'#'+i
      }
      displayNameList.push(u.displayName)
      console.log(`Migrating user ${u.displayName}`)
      return {
      ...u,
      _id:u._id['$oid'],
      tags:[],
      acquintances:[],
      articles:[],
      tokens:[],
      passwords:[]
    }})
    const insertedUsers = await User.insertMany(userToUpdate)
    if(!insertedUsers){
     return false
    }

    
    //insert Credentials, looks good
    const passwordsToUpdate = user_credentials.reverse().filter(c=>true).map((c,i)=>{

      if(usernameList.includes(c.username)){
        c.username = c.username+'#'+i
      }
      usernameList.push(c.username)

      if(emailList.includes(c.email)){
        c.email = c.email+'#'+i
      }
      emailList.push(c.email)

      console.log(`Migrating password for ${c.username}`)
      return {
      _id:c._id['$oid'],
      users:[c.owner['$oid']],
      password:c.password,
      username:c.username,
      email:c.email,
      active:c.enabled
    }})
    const insertedPasswords = await Password.insertMany(passwordsToUpdate)
    if(!insertedPasswords){
      return false
    }

    //insert versions

    const versionsToUpdate = versions.map(v=>{
      console.log(`Migrating version for ${v.article['$oid']} v${v.version}.${v.revision}`)
      return {
        _id:v._id['$oid'],
        //Looks like some data don't have an owner, giving them user[0] _id
        owner:v.owner?v.owner['$oid']:'5abaa342fdb08e1000ab3a21',
        article:v.article['$oid'],
        autosave:v.autosave || false,
        version:v.version,
        revision:v.revision,
        message:v.title,
        md:v.md,
        bib:v.bib,
        yaml:v.yaml,
        sommaire:v.md.split('\n').filter((line) => (line.match(/^#+\ /))).join('\n')
      }
    })
    const insertedVersions = await Version.insertMany(versionsToUpdate)
    if(!insertedVersions){
      return false
    }


    
    //Push to user the articles ID
    for(let i=0;i<articles.length;i++){
      console.log(`Linking ${articles[i].title}`)
      for(let o=0;o<articles[i].owner.length;o++){
        console.log(`to ${articles[i].owner[o]}`)
        await User.findOneAndUpdate({_id: articles[i].owner[o]}, {$push: {articles: articles[i]._id['$oid']}})
      }
    }
    
    //Push to User the password ID
    for(let i=0;i<user_credentials.length;i++){
      console.log(`Linking ${user_credentials[i].owner['$oid']} and ${user_credentials[i].username}`)
      await User.findOneAndUpdate({_id: user_credentials[i].owner['$oid']}, {$push: {passwords: user_credentials[i]._id['$oid']}});
    }
    
    //Push to article the version ID + zotero links
    for(let i=0;i<versions.length;i++){
      console.log(`${versions[i]._id['$oid']} => ${versions[i].article['$oid']}`)
      await Article.findOneAndUpdate({_id: versions[i].article['$oid']}, {$push: {versions: versions[i]._id['$oid']}})
    }

    articlesZotero = {}
    //ZoteroLink
    //2255653/collections/TNJMPE8P
    for(let i=0;i<versions.length;i++){
      //console.log("Zotero =>",versions[i].zoteroGroupID,versions[i].zoteroCollectionKey)
      articlesZotero[versions[i].article['$oid']] = versions[i].zoteroGroupID? versions[i].zoteroCollectionKey? versions[i].zoteroGroupID+'/collections/'+versions[i].zoteroCollectionKey: versions[i].zoteroGroupID : null
      //console.log(`${versions[i]._id['$oid']} => ${versions[i].article['$oid']}`)
      //await Article.findOneAndUpdate({_id: versions[i].article['$oid']}, {$push: {versions: versions[i]._id['$oid']}})
    }
    
    const zoteroToArticles = Object.entries(articlesZotero).filter(o=>o[1]);
    
    for(let i=0;i<zoteroToArticles.length;i++){
      console.log(`updating ZoteroLink for ${zoteroToArticles[i][0]} to ${zoteroToArticles[i][1]}`)
      await Article.findOneAndUpdate({_id: zoteroToArticles[i][0]}, {$set: {zoteroLink: zoteroToArticles[i][1]}})
    }

  }
  catch(err){
    return err
  }

  return true
}