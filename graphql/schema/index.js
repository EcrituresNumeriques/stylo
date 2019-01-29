const { buildSchema } = require('graphql');


module.exports = buildSchema(`
type User {
  _id: ID!
  displayName: String!
  email: String!
  firstName:String
  lastName:String
  institution:String
  tags(limit:Int,page:Int):[Tag!]!
  acquintances(limit:Int,page:Int):[User!]!
  articles(limit:Int,page:Int):[Article!]!
  tokens(limit:Int,page:Int):[Token!]!
  passwords(limit:Int,page:Int):[Password!]!
  admin:Boolean
  yaml:String
  createdAt:String
  updatedAt:String
}

type Tag{
  _id: ID!
  name:String!
  description:String
  articles:[Article!]!
  owner:User!
  createdAt:String
  updatedAt:String
}

type Version{
  _id: ID!
  version:Int
  revision:Int
  md:String
  sommaire:String
  yaml:String
  bib:String
  autosave:Boolean
  article:Article
  owner:User
  createdAt:String
  updatedAt:String
}

type Article {
  _id: ID!
  title: String
  owners(limit:Int,page:Int): [User!]!
  versions(limit:Int,page:Int): [Version!]!
  tags(limit:Int,page:Int):[Tag!]!
  createdAt:String
  updatedAt:String
}

type Token {
  _id: ID!
  name:String
  user:User!
  token:String
  expiresAt:String
  active:Boolean
  createdAt:String!
  updatedAt:String!
}

type Password {
  _id: ID!
  email:String!
  username:String!
  users(limit:Int,page:Int):[User!]!
  defaultUser:User!
  unlock:String
  active:Boolean
  expiresAt:String
  createdAt:String!
  updatedAt:String!
}

type AuthToken {
  token:String
  token_cookie:String
  password:Password!
  users:[User!]!
}

input UserInput {
  email: String!
  username: String!
  password: String!
  displayName: String
  firstName: String
  lastName: String
  institution: String
}

input VersionInput {
  article:ID!
  major:Boolean
  auto: Boolean
  md: String
  yaml: String
  bib: String
}


type RootQuery {
  # admins only
  "Reserved for admins"
  articles:[Article!]!
  "Reserved for admins"
  users:[User!]!


  "Fetch user info [need to be authentificated as this user]"
  user(user:ID!):User!

  "Fetch bearer token based on your cookie graphQL-jwt [Need to be loged in previously and send the appropriate cookie]"
  refreshToken(expiration:String):AuthToken

  "Fetch article info [need to have acces to this article]"
  article(article:ID!):Article!
  
  "Login using email/username and password, retrieve token+cookie"
  login(username:String,email:String,password:String!):AuthToken
}

type RootMutation {

  "Create user + password + default article"
  createUser(user:UserInput!):User!

  "Log in the request, store user and password to be used as 'new' in userID fields"
  loginMutation(username:String,email:String,password:String!):Password!

  "Add an email to your acquintances [need to be authentificated as user]"
  addAcquintance(email:String!,user:ID!):User!
  
  "Change password"
  changePassword(password:ID!,old:String!,new:String!,user:ID!):Password!

  #TODO
  #require Email provider
  #resetPassword(password:ID!,jwt:String!,new:String!):Password!
  # addToken(user:ID!):Token!

  "Give access to a user using a password's email"
  addCredential(email:String!,user:ID!):User!
  # If need to create new user user createUser + addCredential

  "Remove access to a user using a password's email (can't be the main email)"
  removeCredential(email:String!,user:ID!):User!

  "Change default user when login in + for loginMutation"
  setPrimaryUser(password:ID!,user:ID!):Password!
  
  "Create article for specified user [need to be authentificated as specified user]"
  createArticle(title:String!,user:ID!):Article!

  "Save a new version for article [need to be authentificated as specified user]"
  saveVersion(version:VersionInput!,user:ID!):Version!
  
  "Create tag [need to be authentificated as specified user]"
  createTag(name:String!,description:String,user:ID!):Tag!
  
  "Delete tag and all articles carrying it"
  deleteTag(tag:ID!,user:ID!):User!

  "Add article to a specified tag [Need to be authenficated as owner of the tag]"
  addToTag(article:ID!,tag:ID!,user:ID!):Article!

  "Remove article from a specified tag [Need to be authenficated as owner of the tag]"
  removeFromTag(article:ID!,tag:ID!,user:ID!):Article!

  "add a user to an article"
  shareArticle(article:ID!,to:ID!,user:ID!):Article!

  "Send last version, or specified version, to an user"
  sendArticle(article:ID!,version:ID,to:ID!,user:ID!):Article! # this is a copy of last version OR specified version
  # fork is sendArticle to yourself

  "Rename an article you own"
  renameArticle(article:ID!,title:String!,user:ID!):Article!

  
  # deleteArticle(article:ID!,user:ID!):Article!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);
