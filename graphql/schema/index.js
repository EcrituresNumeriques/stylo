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
  title:String!
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
  unlock:String
  active:Boolean
  expiresAt:String
  createdAt:String!
  updatedAt:String!
}

input UserInput {
  email: String!
  username: String!
  password: String!
}

input VersionInput {
  article:ID!
  version: Int!
  revision: Int!
  md: String
  yaml: String
  bib: String

}

type RootQuery {
  # admins : users:[User!]!
  # admins : articles:[Article!]!

  user(_id:ID!):User!
  login(username:String,email:String,password:String!):Password
  # article(_id:ID!):Article!
}

type RootMutation {
  createUser(user:UserInput!):User!
  # createArticle(title:String!):Article!
  # autosave(version:VersionInput!):Version!
  # save(version:VersionInput!):Version!
  # createTag(title:String!):Tag!
  # addToTag(article:ID!,tag:ID!):Article!
  # shareArticle(article:ID!,to:ID!):Article!
  # sendArticle(article:ID!,to:ID!):Article!
  # forkArticle(version:ID!):Article!
  # renameArticle(article:ID!,title:String!):Article!
  # deleteArticle(article:ID!):Article!
  # addPassword(password:UserInput!):Password!
  # addToken(user:ID!):Token!
  # addUser(user:UserInput!,password:ID!):User!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);


