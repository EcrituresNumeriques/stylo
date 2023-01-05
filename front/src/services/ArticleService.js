import { runQuery } from '../helpers/graphQL.js'

import { updateWorkingVersion } from './ArticleService.graphql'

export default class ArticleService {
  constructor (userId, articleId, sessionToken, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.sessionToken = sessionToken
    this.applicationConfig = applicationConfig
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

  async saveMetadata (yaml) {
    const { sessionToken, graphqlEndpoint } = this

    return runQuery({ sessionToken, graphqlEndpoint }, {
      query: updateWorkingVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        content: { yaml }
      }
    })
  }
}
