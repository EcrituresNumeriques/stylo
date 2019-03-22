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

    const articlesToUpdate = articles.filter(a=>a.title).map(a=>({...a,_id:a._id['$oid'],owners:a.owner}))
    const insertedArticles = await Article.insertMany(articlesToUpdate)
    if(!insertedArticles){
     return false
    }

    // insert users, ARTICLES + PASSWORDS missing
    const userToUpdate = users.filter(u=>true).reverse().map((u,i)=>{
      if(displayNameList.includes(u.displayName)){
        u.displayName = u.displayName+'#'+i
      }
      displayNameList.push(u.displayName)
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

  }
  catch(err){
    return err
  }

  return true
}