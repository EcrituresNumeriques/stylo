const { makeExecutableSchema } = require('@graphql-tools/schema')
const resolvers = require('./resolvers/index.js')

const typeDefs = `#graphql
scalar EmailAddress

type User {
  _id: ID
  displayName: String
  authType: String
  email: EmailAddress
  firstName: String
  lastName: String
  institution: String
  tags(limit: Int, page: Int): [Tag]
  permissions: [UserPermission]
  acquintances(limit: Int, page: Int): [User]
  articles(limit: Int, page: Int): [Article]
  admin: Boolean
  yaml: String
  zoteroToken: String
  createdAt: String
  updatedAt: String
  apiToken: String

  article(id: ID!): Article
}

type UserPermission {
  scope: String!
  user: User!
  roles: [String]
}

type Tag {
  _id: ID!
  name: String!
  owner: ID
  description: String
  color: String
  articles: [Article]
  createdAt: String
  updatedAt: String
}

type WorkingVersion {
  md: String
  yaml: String
  bib: String
}

type Version {
  _id: ID!
  name: String
  version: Int
  revision: Int
  md: String
  sommaire: String
  yaml: String
  bib: String
  message: String
  article: Article
  owner: User
  createdAt: String
  updatedAt: String
}

type Article {
  _id: ID!
  title: String
  zoteroLink: String
  owner: User
  contributors: [ArticleContributor]!
  workingVersion: WorkingVersion
  versions(limit: Int, page: Int): [Version!]!
  tags(limit: Int, page: Int): [Tag!]!
  createdAt: String
  updatedAt: String

  delete(dryRun: Boolean): Boolean
  addTags(tags: [ID]!): [Tag]
  removeTags(tags: [ID]!): [Tag]
  updateWorkingVersion(content: WorkingVersionInput!): WorkingVersion
}

type ArticleContributor {
  user: User!
  roles: [String]
}

input VersionInput {
  article: ID!
  major: Boolean
  message: String
}

# input WorkingVersionInput @oneOf {
input WorkingVersionInput {
  bib: String,
  md: String,
  yaml: String,
}

input NewUserInput {
  email: EmailAddress!
  username: String!
  password: String!
  passwordC: String!
  displayName: String
  firstName: String
  lastName: String
  institution: String
}

input UserProfileInput {
  displayName: String!
  firstName: String
  lastName: String
  institution: String
  yaml: String
  zoteroToken: String
}

type Query {
  "Fetch all users [Reserved for admins]"
  users: [User]

  "Fetch authenticated user info"
  user(user: ID): User

  "Fetch accounts we have access to"
  userGrantedAccess: [User]

  "Fetch tagged articles for a given user"
  tags(user: ID!): [Tag]

  "Fetch tagged articles for a given user"
  tag(tag: ID!): Tag

  "Fetch a given user articles"
  articles (user: ID!): [Article]

  "Fetch article info [need to have acces to this article]"
  article(article: ID!): Article

  "Fetch version info"
  version(version: ID!): Version
}

type Mutation {
  "Create user + password + default article"
  createUser(details: NewUserInput!): User!

  "Add an email to your acquintances [need to be authentificated as user]"
  addAcquintance(email: EmailAddress!, user: ID!): User

  "Change password"
  changePassword(old: String!, new: String!, user: ID!): User

  "Grant account access"
  grantAccountAccess(user: ID!, to: ID!): User

  "Revoke account access"
  revokeAccountAccess(user: ID!, to: ID!): User

  "Change user information"
  updateUser(user: ID!, details: UserProfileInput!): User

  "Give access to a user using a password's email"
  addCredential(email: EmailAddress!, user: ID!): User
  # If need to create new user: createUser + addCredential

  "Remove access to a user using a password's email (can't be the main email)"
  removeCredential(email: EmailAddress!, user: ID!): User

  "Create article for specified user [need to be authentificated as specified user]"
  createArticle(title: String!, user: ID!, tags: [ID]): Article

  "Save a new version for article [need to be authentificated as specified user]"
  saveVersion(version: VersionInput!, user: ID!): Version

  "Create tag [need to be authentificated as specified user]"
  createTag(
    name: String!
    description: String
    user: ID!
    color: String!
  ): Tag

  "update name and description of a tag [need to be authentificated as specified user]"
  updateTag(
    name: String
    description: String
    color: String
    tag: ID!
    user: ID!
  ): Tag

  "Delete tag and all articles carrying it"
  deleteTag(tag: ID!, user: ID!): User

  "add a user to an article"
  shareArticle(article: ID!, to: ID!, user: ID!): Article

  "remove a user to an article"
  unshareArticle(article: ID!, to: ID!, user: ID!): Article

  "Duplicate the working version of an article, with someone, or yourself"
  duplicateArticle(article: ID!, to: ID!, user: ID!): Article

  "Rename an article you own"
  renameArticle(article: ID!, title: String!, user: ID!): Article

  "Change the zoteroLink to an article"
  zoteroArticle(article: ID!, zotero: String!, user: ID!): Article
}`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
