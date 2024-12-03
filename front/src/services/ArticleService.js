import { runQuery } from '../helpers/graphQL.js'

import { updateWorkingVersion, createVersion } from './ArticleService.graphql'

export default class ArticleService {
  constructor (userId, articleId, sessionToken, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.sessionToken = sessionToken
    this.graphqlEndpoint = applicationConfig.graphqlEndpoint
  }

  async saveText (md) {
    const { sessionToken, graphqlEndpoint } = this

    return runQuery({ sessionToken, graphqlEndpoint }, {
      query: updateWorkingVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        content: { md }
      }
    })
  }

  async saveBibliography (bib) {
    const { sessionToken, graphqlEndpoint } = this

    return runQuery({ sessionToken, graphqlEndpoint }, {
      query: updateWorkingVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        content: { bib }
      }
    })
  }

  async saveMetadata (metadata) {
    const { sessionToken, graphqlEndpoint } = this

    return runQuery({ sessionToken, graphqlEndpoint }, {
      query: updateWorkingVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        content: { metadata }
      }
    })
  }

  async createNewVersion (major = false, message = '') {
    const { sessionToken, graphqlEndpoint } = this

    return await runQuery({ sessionToken, graphqlEndpoint }, {
      query: createVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        major,
        message
      }
    })
  }
}
