const { makeExecutableSchema } = require('@graphql-tools/schema')
const resolvers = require('./resolvers/index.js')

const typeDefs = `#graphql
scalar EmailAddress
scalar JWT
scalar DateTime
scalar HexColorCode
scalar String
scalar ID
scalar Int
scalar Boolean

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
  createdAt: DateTime
  updatedAt: DateTime
  apiToken: JWT

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
  color: HexColorCode
  articles: [Article]
  createdAt: DateTime
  updatedAt: DateTime
}

type WorkingVersion {
  bib: String
  md: String
  yaml: String
  yamlReformated: String
}

type Version {
  _id: ID!
  name: String
  version: Int
  revision: Int
  md: String
  sommaire: String
  yaml: String
  yamlReformated: String
  bib: String
  message: String
  article: Article
  owner: User
  createdAt: DateTime
  updatedAt: DateTime
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
  preview: ArticlePreviewSettings
  createdAt: DateTime
  updatedAt: DateTime

  addTags(tags: [ID]!): [Tag]
  delete(dryRun: Boolean): Boolean
  removeTags(tags: [ID]!): [Tag]
  rename(title: String!): Boolean
  setPreviewSettings(settings: ArticlePreviewInput!): Article
  setZoteroLink(zotero: String!): Boolean
  updateWorkingVersion(content: WorkingVersionInput!): Article
  workspaces: [Workspace!]
}

type ArticlePreviewSettings {
  stylesheet: String!
  template: String
}

input ArticlePreviewInput {
  stylesheet: String
  template: String
}

type ArticleContributor {
  user: User!
  roles: [String]
}

type InstanceUsageStats {
  version: String
  users: InstanceUserStats
  articles: InstanceArticleStats
}

interface InstanceObjectUsageStats {
  total: Int!
  # currentYear: Int!
  years: [InstanceObjectUsageYearlyStats]
}

type InstanceObjectUsageYearlyStats {
  year: Int
  count: Int
  # variation: Int
}

type InstanceUserStats implements InstanceObjectUsageStats {
  total: Int!
  # currentYear: Int!
  local: Int
  openid: Int
  years: [InstanceObjectUsageYearlyStats]
}

type InstanceArticleStats implements InstanceObjectUsageStats {
  total: Int!
  # currentYear: Int!
  years: [InstanceObjectUsageYearlyStats]
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

type WorkspaceArticle {
  workspace: Workspace!
  article: Article
  
  # mutation
  remove: Workspace!
}

type WorkspaceMember {
  workspace: Workspace!
  user: User

  # mutation
  remove: Workspace!
}

type Workspace {
  _id: String!
  name: String!
  color: HexColorCode!
  role: String
  bibliographyStyle: String
  members: [User!]!
  articles: [Article!]!
  creator: User!
  createdAt: String
  updatedAt: String

  article(articleId: ID!): WorkspaceArticle
  member(userId: ID!): WorkspaceMember

  # mutations
  leave: Workspace
  inviteMember(userId: ID!, role: String): Workspace
  addArticle(articleId: ID!): Workspace
}

"Input to create a new workspace"
input CreateWorkspaceInput {
  name: String!
  color: String!
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

  "Fetch instance stats"
  stats: InstanceUsageStats

  "Get a given workspace"
  workspace(workspaceId: ID!): Workspace

  "Fetch workspaces for the authenticated user"
  workspaces: [Workspace!]
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
    color: HexColorCode!
  ): Tag

  "update name and description of a tag [need to be authentificated as specified user]"
  updateTag(
    name: String
    description: String
    color: HexColorCode
    tag: ID!
    user: ID!
  ): Tag

  "Delete tag, and remove it from all related articles"
  deleteTag(tag: ID!, user: ID!): Boolean

  "add a user to an article"
  shareArticle(article: ID!, to: ID!, user: ID!): Article

  "remove a user to an article"
  unshareArticle(article: ID!, to: ID!, user: ID!): Article

  "Duplicate the working version of an article, with someone, or yourself"
  duplicateArticle(article: ID!, to: ID!, user: ID!): Article

  "Create a new workspace"
  createWorkspace(createWorkspaceInput: CreateWorkspaceInput!): Workspace

  "Get a workspace for mutation"
  workspace(workspaceId: ID!): Workspace
}`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
