import { runQuery } from '../helpers/graphQL.js'

import { saveVersion } from './ArticleService.graphql'

export default class VersionService {

  constructor (userId, articleId, sessionToken, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.sessionToken = sessionToken
    this.applicationConfig = applicationConfig
  }

  async createNewArticleVersion (major = false, message = '') {
    const { sessionToken, graphqlEndpoint } = this

    return await runQuery({ sessionToken, graphqlEndpoint }, {
      query: saveVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        major,
        message
      }
    })
  }
}
