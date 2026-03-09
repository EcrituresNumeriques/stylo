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

enum CorpusType {
  neutral
  # revue
  journal
  # thesis/mémoire
  thesis
  # livre
  book
}

enum AuthTokenService {
  humanid
  hypothesis
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

type AuthProvider {
  id: String
  token: String
  updatedAt: DateTime
}

type AuthProvidersMap {
  humanid: AuthProvider
  hypothesis: AuthProvider
  zotero: AuthProvider
}

type User {
  _id: ID
  displayName: String
  username: String
  authTypes: [AuthType]
  authProviders: AuthProvidersMap
  email: EmailAddress
  firstName: String
  lastName: String
  institution: String
  tags: [Tag]
  permissions: [UserPermission]
  acquintances(limit: Int, page: Int): [User]
  articles(limit: Int, page: Int): [Article]
  workspaces: [Workspace!]
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime
  """
  @deprecated Use addContact mutation at the root instead.
  """
  addContact(userId: ID!): User
  """
  @deprecated Use removeContact mutation at the root instead.
  """
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

type BibliographyEntry {
  authorName: String
  date: String
  entry: JSON
  key: String!
  title: String!
  type: String!
}

type WorkingVersion {
  bib: String
  bibPreview: String
  bibliography: [BibliographyEntry]
  md: String
  metadata: JSON
  metadataFormType: String
  yaml (options: YamlFormattingInput): String
}

type Version {
  _id: ID!
  name: String
  version: Int
  revision: Int
  md: String
  type: String
  metadata: JSON
  metadataFormType: String
  yaml (options: YamlFormattingInput): String
  bib: String
  bibPreview: String
  bibliography: [BibliographyEntry]
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

input UpdateArticleInput {
  id: ID!
  title: String!
  tags: [ID]
  workspaces: [ID]
}

input UpdateArticleBibliographyInput {
  articleId: ID!
  bib: String!
}

type Article {
  _id: ID!
  title: String
  zoteroLink: String
  nakalaLink: String
  owner: User
  contributors: [ArticleContributor]!
  workingVersion: WorkingVersion
  versions(limit: Int, page: Int): [Version!]
  tags: [Tag!]!
  preview: ArticlePreviewSettings
  createdAt: DateTime
  updatedAt: DateTime

  addTags(tags: [ID]!): [Tag]
  delete(dryRun: Boolean): Boolean
  removeTags(tags: [ID]!): [Tag]
  rename(title: String!): Boolean
  setPreviewSettings(settings: ArticlePreviewInput!): Article
  setZoteroLink(zotero: String!): Boolean
  setNakalaLink(nakala: String!): Boolean
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
  metadataFormType: String
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

input NewUserWithAuthInput {
  displayName: String
  firstName: String
  institution: String
  lastName: String
}

input UserProfileInput {
  displayName: String
  firstName: String
  lastName: String
  institution: String
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

"""
Form definition based on React JSON schema.
It consists of:
- data: the data structure in JSON schema format
- ui: the user interface configuration

Both must be valid JSON.
"""
type WorkspaceFormMetadata {
  data: String
  ui: String
}

type Workspace {
  _id: String!
  name: String!
  description: String
  color: HexColorCode!
  bibliographyStyle: String
  formMetadata: WorkspaceFormMetadata
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

"Input to update the form metadata on a workspace"
input UpdateWorkspaceFormMetadataInput {
  data: String
  ui: String
}

"Input to create a new workspace"
input CreateWorkspaceInput {
  name: String!
  color: String!
  description: String
}

input SetCorpusArticlesInput {
  corpusId: ID!
  articleIds: [ID]
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
  name: String
  description: String
  metadata: JSON
}

type Corpus {
  _id: String!
  type: CorpusType!
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
  type: CorpusType!
  description: String
  metadata: JSON
  workspace: String
}

input FilterCorpusInput {
  workspaceId: ID
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

  "Fetch articles, optionally from a given Workspace"
  articles (user: ID, filter: FilterCorpusInput): [Article]

  "Fetch article info [need to have access to this article]"
  article(user: ID, article: ID!): Article

  "Fetch an article [with an access key]"
  sharedArticle(article: ID!, accessKey: JWT): Article

  "Fetch version info"
  version(version: ID!): Version

  "Fetch instance stats"
  stats: InstanceUsageStats

  "Get a given workspace"
  workspace(workspaceId: ID): Workspace

  "Get a list of workspaces for the authenticated user"
  workspaces: [Workspace!]

  """
  Get a list of corpus with an optional filter
  """
  corpus(filter: FilterCorpusInput): [Corpus!]

  "Get a corpus [with an access key]"
  sharedCorpus(corpusId: ID!, accessKey: JWT): Corpus
}

type Mutation {
  """
  Create a new user account with email/password authentication.
  Also creates a default article for the new user.
  """
  createUser(details: NewUserInput!): User!

  """
  Finalize user account creation after authentication with an external provider (e.g. OIDC).
  Returns a JWT token for the newly created session.
  """
  createUserWithAuth(details: NewUserWithAuthInput!, service: AuthTokenService!): String

  """
  Log out the currently authenticated user and invalidate the current session.
  """
  logout: User

  """
  Link an external service token (HumanID, Hypothesis, Zotero) to the current user account.
  Requires authentication.
  """
  setAuthToken(service: AuthTokenService!): User

  """
  Unlink an external authentication service from the current user account.
  Removes the stored token for the given service.
  Requires authentication.
  """
  unsetAuthToken(service: AuthTokenService!): User

  """
  Add a user to your contacts list by their user ID.
  Requires authentication.
  """
  addContact(contactUserId: ID!): User

  """
  Remove a user from your contacts list by their user ID.
  Requires authentication.
  """
  removeContact(contactUserId: ID!): User

  """
  Add a user to your contacts list by their email address.
  Requires authentication as the specified user.
  @deprecated Use addContact instead.
  """
  addAcquintance(email: EmailAddress!, user: ID): User

  """
  Change the password for the specified user account.
  Requires authentication as the specified user.
  """
  changePassword(old: String!, new: String!, user: ID): User

  """
  Update profile information for the specified user (display name, first/last name, institution).
  Requires authentication as the specified user.
  """
  updateUser(user: ID, details: UserProfileInput!): User

  """
  Grant access to a user account via an additional email address (credential).
  To create a new user with a credential: call createUser first, then addCredential.
  Requires authentication as the specified user.
  """
  addCredential(email: EmailAddress!, user: ID): User

  """
  Revoke access to a user account for a given email address.
  The email must not be the account's primary email.
  Requires authentication as the specified user.
  """
  removeCredential(email: EmailAddress!, user: ID): User

  """
  Create a new article for the authenticated user.
  Optionally assigns tags and workspaces to the article at creation time.
  Requires authentication as the specified user.
  """
  createArticle(createArticleInput: CreateArticleInput!): Article

  """
  Create a new tag for the authenticated user.
  Tags can be used to organise and filter articles.
  Requires authentication.
  """
  createTag(
    name: String!
    description: String
    color: HexColorCode!
  ): Tag

  """
  Update the name, description, or color of an existing tag.
  Requires authentication as the tag owner.
  """
  updateTag(
    name: String
    description: String
    color: HexColorCode
    tag: ID!
  ): Tag

  """
  Delete a tag and remove it from all articles it was applied to.
  Requires authentication as the tag owner.
  """
  deleteTag(tag: ID!, user: ID): Boolean

  """
  Share an article with another user, granting them contributor access.
  Requires authentication as the article owner.
  """
  shareArticle(article: ID!, to: ID!, user: ID): Article

  """
  Remove a user's contributor access from an article.
  Requires authentication as the article owner.
  """
  unshareArticle(article: ID!, to: ID!, user: ID): Article

  """
  Duplicate the working version of an article and assign it to another user (or yourself).
  The duplicate is created as a new, independent article.
  Requires authentication as the specified user.
  """
  duplicateArticle(article: ID!, to: ID!, user: ID): Article

  """
  Create a new workspace.
  The authenticated user becomes the creator and first member of the workspace.
  """
  createWorkspace(createWorkspaceInput: CreateWorkspaceInput!): Workspace

  """
  Update the JSON schema form metadata for a workspace.
  Controls the custom metadata form displayed in the workspace editor.
  Requires authentication as a workspace member.
  """
  updateWorkspaceFormMetadata(details: UpdateWorkspaceFormMetadataInput!, workspaceId: ID!): Workspace

  """
  Retrieve a workspace by ID to perform mutations on it (e.g. adding members or articles).
  Returns an error if the workspace does not exist or cannot be accessed.
  """
  workspace(workspaceId: ID!): Workspace

  """
  Retrieve an article by ID to perform mutations on it.
  Returns an error if the article does not exist or cannot be accessed.
  """
  article(articleId: ID!): Article

  """
  Update an article's title, tags, or workspaces.
  Requires authentication as the article owner.
  """
  updateArticle(updateArticleInput: UpdateArticleInput!): Article!

  """
  Retrieve a corpus by ID to perform mutations on it.
  Returns an error if the corpus does not exist or cannot be accessed.
  """
  corpus(corpusId: ID!): Corpus

  """
  Updates the articles associated with the corpus.
  Existing articles that are not in the list will be removed, and articles not currently present will be added.
  """
  setCorpusArticles(setCorpusArticlesInput: SetCorpusArticlesInput!): Corpus

  """
  Create a new corpus in a workspace.
  A corpus groups articles together for publication or export purposes.
  """
  createCorpus(createCorpusInput: CreateCorpusInput!): Corpus

  """
  Update the bibliography of an article from a BibTeX string.
  Returns the updated bibliography as a list of structured entries.
  Requires authentication with access to the article (as owner, contributor, or via a workspace).
  """
  updateArticleBibliography(input: UpdateArticleBibliographyInput!): [BibliographyEntry]
}`

module.exports = makeExecutableSchema({ typeDefs, resolvers })
