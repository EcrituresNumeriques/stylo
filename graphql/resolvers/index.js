import {
  DateTimeResolver,
  EmailAddressResolver,
  HexColorCodeResolver,
  JWTResolver,
} from 'graphql-scalars'
import {
  Article,
  Mutation as ArticleMutation,
  Query as ArticleQuery,
  WorkingVersion,
} from './articleResolver.js'
import { Mutation as AuthMutation } from './authResolver.js'
import {
  Corpus,
  Mutation as CorpusMutation,
  Query as CorpusQuery,
} from './corpusResolver.js'
import { GraphQLJSON, GraphQLJSONObject } from './jsonScalar.js'
import { InstanceUsageStats, Query as StatsQuery } from './statsResolver.js'
import {
  Tag,
  Mutation as TagMutation,
  Query as TagQuery,
} from './tagResolver.js'
import {
  User,
  Mutation as UserMutation,
  Query as UserQuery,
} from './userResolver.js'
import {
  Version,
  Mutation as VersionMutation,
  Query as VersionQuery,
} from './versionResolver.js'
import {
  Workspace,
  Mutation as WorkspaceMutation,
  Query as WorkspaceQuery,
} from './workspaceResolver.js'

/**
 * Expose the identifier as `id` (instead of the MongoDB `_id`),
 * for both Mongoose documents and lean objects.
 */
function withId(resolvers = {}) {
  return {
    ...resolvers,
    id: (object) => object._id.toString(),
  }
}

// Custom Scalars

// Types and Nested queries/mutations
const UserResolver = withId(User)

export const UserSearch = withId()

const ArticleResolver = withId(Article)

const TagResolver = withId(Tag)

const VersionResolver = withId(Version)

const WorkspaceResolver = withId(Workspace)

const CorpusResolver = withId(Corpus)

// Root queries & mutations
export const Query = {
  ...UserQuery,
  ...ArticleQuery,
  ...TagQuery,
  ...VersionQuery,
  ...StatsQuery,
  ...WorkspaceQuery,
  ...CorpusQuery,
}

export const Mutation = {
  ...UserMutation,
  ...ArticleMutation,
  ...TagMutation,
  ...VersionMutation,
  ...AuthMutation,
  ...WorkspaceMutation,
  ...CorpusMutation,
}

export {
  ArticleResolver as Article,
  CorpusResolver as Corpus,
  DateTimeResolver as DateTime,
  EmailAddressResolver as EmailAddress,
  GraphQLJSON as JSON,
  GraphQLJSONObject as JSONObject,
  HexColorCodeResolver as HexColorCode,
  InstanceUsageStats,
  JWTResolver as JWT,
  TagResolver as Tag,
  UserResolver as User,
  VersionResolver as Version,
  WorkingVersion,
  WorkspaceResolver as Workspace,
}
