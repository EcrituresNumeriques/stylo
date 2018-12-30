const { buildSchema } = require('graphql');


module.exports = buildSchema(`
type User {
  _id: ID!
  displayName: String!
  email: String!
  tags(limit:Int,page:Int):[Tag!]!
  articles(limit:Int,page:Int):[Article!]!
  tokens(limit:Int,page:Int):[Token!]!
  passwords(limit:Int,page:Int):[Password!]!
  admin:Boolean
  firstName:String
  lastName:String
  institution:String
  yaml:String
  createdAt:String
  updatedAt:String
}

type Tag{
  _id: ID!
}

type Version{
  _id: ID!
}

type Article {
  _id: ID!
  owners: [User!]!
  title: String
  versions: [Version!]!
}

type Token {
  _id: ID!
  createdAt:String!
  updatedAt:String!
  user:User!
  name:String
  active:Boolean
  expiresAt:String
}

type Password {
  _id: ID!
  createdAt:String!
  updatedAt:String!
  users(limit:Int,page:Int):[User!]!
  username:String!
  email:String!
  unlock:String
  active:Boolean
  expiresAt:String
}

input UserInput {
  email: String!
  username: String!
  password: String!
}

type RootQuery {
  users:[User!]!
}

type RootMutation {
  createUser(user:UserInput):User!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);


