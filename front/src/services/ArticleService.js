import { executeQuery } from '../helpers/graphQL.js'

import { updateWorkingVersion, createVersion } from './ArticleService.graphql'

export default class ArticleService {
  constructor(userId, articleId, sessionToken) {
    this.userId = userId
    this.articleId = articleId
    this.sessionToken = sessionToken
  }

  async saveText(md) {
    const { sessionToken } = this

    return executeQuery({
      sessionToken,
      query: updateWorkingVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        content: { md },
      },
      type: 'mutate',
    })
  }

  async saveBibliography(bib) {
    const { sessionToken } = this

    return executeQuery({
      sessionToken,
      query: updateWorkingVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        content: { bib },
      },
      type: 'mutate',
    })
  }

  async saveMetadata(metadata) {
    const { sessionToken } = this

    return executeQuery({
      sessionToken,
      query: updateWorkingVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        content: { metadata },
      },
      type: 'mutate',
    })
  }

  async createNewVersion(major = false, message = '') {
    const { sessionToken } = this

    return await executeQuery({
      sessionToken,
      query: createVersion,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        major,
        message,
      },
      type: 'mutate',
    })
  }
}
