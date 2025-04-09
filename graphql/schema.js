const { makeExecutableSchema } = require('@graphql-tools/schema')
const resolvers = require('./resolvers/index.js')

const typeDefs = `#graphql
scalar JSON
scalar JSONObject
scalar EmailAddress
scalar JWT
scalar DateTime
scalar HexColorCode
scalar String
scalar ID
scalar Int
scalar Boolean

enum AuthType {
  oidc
  local
}

enum AuthTokenService {
  zotero
}

type UserSearch {
  _id: ID
  displayName: String
  email: EmailAddress
  firstName: String
  lastName: String
}

input UserFilter {
  email: String!
}

type UserStats {
  myArticlesCount: Int
  contributedArticlesCount: Int
}

type User {
  _id: ID
  displayName: String
  username: String
  authType: AuthType
  authTypes: [AuthType]
  email: EmailAddress
  firstName: String
  lastName: String
  institution: String
  tags(limit: Int, page: Int): [Tag]
  permissions: [UserPermission]
  acquintances(limit: Int, page: Int): [User]
  articles(limit: Int, page: Int): [Article]
  workspaces: [Workspace!]
  zoteroToken: String
  createdAt: DateTime
  updatedAt: DateTime
  apiToken: JWT

  addContact(userId: ID!): User
  removeContact(userId: ID!): User

  stats: UserStats
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
  bibPreview: String
  md: String
  metadata: JSON
  yaml (options: YamlFormattingInput): String
}

type Version {
  _id: ID!
  name: String
  version: Int
  revision: Int
  md: String
  sommaire: String
  type: String
  metadata: JSON
  yaml (options: YamlFormattingInput): String
  bib: String
  bibPreview: String
  message: String
  article: Article
  owner: User
  createdAt: DateTime
  updatedAt: DateTime

  rename(name: String): Boolean
}

input ArticleVersionInput {
  userId: ID!
  major: Boolean
  message: String
}

input CreateArticleInput {
  title: String!
  tags: [ID]
  workspaces: [ID]
}

type Article {
  _id: ID!
  title: String
  zoteroLink: String
  owner: User
  contributors: [ArticleContributor]!
  workingVersion: WorkingVersion
  versions(limit: Int, page: Int): [Version!]
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

  addContributor(userId: ID!): Article
  removeContributor(userId: ID!): Article
  createVersion(articleVersionInput: ArticleVersionInput!): Article
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

input WorkingVersionInput {
  bib: String,
  md: String,
  metadata: JSON,
}

input YamlFormattingInput {
  strip_markdown: Boolean
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
  displayName: String
  firstName: String
  lastName: String
  institution: String
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

type WorkspaceStats {
  articlesCount: Int
  membersCount: Int
}

type Workspace {
  _id: String!
  name: String!
  description: String
  color: HexColorCode!
  bibliographyStyle: String
  members: [User!]!
  articles: [Article!]!
  corpus: [Corpus!]!
  creator: User!
  createdAt: DateTime
  updatedAt: DateTime

  article(articleId: ID!): WorkspaceArticle
  member(userId: ID!): WorkspaceMember

  stats: WorkspaceStats

  # mutations
  leave: Workspace
  inviteMember(userId: ID!): Workspace
  addArticle(articleId: ID!): Workspace
}

"Input to create a new workspace"
input CreateWorkspaceInput {
  name: String!
  color: String!
  description: String
}

type CorpusArticle {
  corpus: Corpus!
  article: Article
  order: Int

  # mutation
  remove: Corpus!
  move(order: Int): Corpus
}

input ArticleOrder {
  articleId: ID!
  order: Int!
}

input UpdateCorpusInput {
  name: String!
  description: String
  metadata: JSON
}

type Corpus {
  _id: String!
  name: String!
  description: String
  metadata: JSON
  workspace: String
  articles: [CorpusArticle!]!
  creator: User!
  createdAt: DateTime
  updatedAt: DateTime

  article(articleId: ID!): CorpusArticle

  # mutations
  addArticle(articleId: ID!): Corpus
  rename(name: String!): Corpus
  updateMetadata(metadata: JSON!): Corpus
  updateArticlesOrder(articlesOrderInput: [ArticleOrder!]!): Corpus
  delete: Corpus!
  update(updateCorpusInput: UpdateCorpusInput!): Corpus!
}

input CreateCorpusInput {
  name: String!
  description: String
  metadata: String
  workspace: String
}

input FilterCorpusInput {
  workspaceId: String
  corpusId: ID
}

type Query {
  """
  Get authenticated user info.
  """
  user(user: ID): User

  getUser(filter: UserFilter): User

  "Fetch tagged articles for a given user"
  tags(user: ID): [Tag]

  "Fetch tagged articles for a given user"
  tag(user: ID, tag: ID!): Tag

  "Fetch a given user articles"
  articles (user: ID): [Article]

  "Fetch article info [need to have access to this article]"
  article(user: ID, article: ID!): Article

  "Fetch version info"
  version(version: ID!): Version

  "Fetch instance stats"
  stats: InstanceUsageStats

  "Get a given workspace"
  workspace(workspaceId: ID!): Workspace

  "Get a list of workspaces for the authenticated user"
  workspaces: [Workspace!]

  """
  Get a list of corpus with an optional filter
  """
  corpus(filter: FilterCorpusInput): [Corpus!]
}

type Mutation {
  "Create user + password + default article"
  createUser(details: NewUserInput!): User!

  "Sets a user authentication token (to something, or nothing if unlinking services"
  setAuthToken (service: AuthTokenService!, token: String): User

  "Add an email to your acquintances [need to be authentificated as user]"
  addAcquintance(email: EmailAddress!, user: ID): User

  "Change password"
  changePassword(old: String!, new: String!, user: ID): User

  "Change user information"
  updateUser(user: ID, details: UserProfileInput!): User

  "Give access to a user using a password's email"
  addCredential(email: EmailAddress!, user: ID): User
  # If need to create new user: createUser + addCredential

  "Remove access to a user using a password's email (can't be the main email)"
  removeCredential(email: EmailAddress!, user: ID): User

  "Create article for specified user [need to be authenticated as specified user]"
  createArticle(createArticleInput: CreateArticleInput!): Article

  "Create tag [need to be authenticated as specified user]"
  createTag(
    name: String!
    description: String
    color: HexColorCode!
  ): Tag

  "update name and description of a tag [need to be authenticated as specified user]"
  updateTag(
    name: String
    description: String
    color: HexColorCode
    tag: ID!
  ): Tag

  "Delete tag, and remove it from all related articles"
  deleteTag(tag: ID!, user: ID): Boolean

  "add a user to an article"
  shareArticle(article: ID!, to: ID!, user: ID): Article

  "remove a user to an article"
  unshareArticle(article: ID!, to: ID!, user: ID): Article

  "Duplicate the working version of an article, with someone, or yourself"
  duplicateArticle(article: ID!, to: ID!, user: ID): Article

  "Create a new workspace"
  createWorkspace(createWorkspaceInput: CreateWorkspaceInput!): Workspace

  "Get a workspace for mutation"
  workspace(workspaceId: ID!): Workspace

  """
  Get an article for a given id.
  Returns an error if the corpus does not exist or cannot be accessed.
  """
  article(articleId: ID!): Article

  """
  Get a corpus for a given id.
  Returns an error if the corpus does not exist or cannot be accessed.
  """
  corpus(corpusId: ID!): Corpus

  "Create a new corpus"
  createCorpus(createCorpusInput: CreateCorpusInput!): Corpus
}`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
