import askGraphQL from "../helpers/graphQL"

const createNewArticleVersionQuery = `mutation($userId: ID!, $articleId: ID!, $major: Boolean!, $message: String) {
  saveVersion(
    version: {
      article: $articleId,
      major: $major,
      message: $message
    },
    user: $userId
  ) {
    _id
    version
    revision
    message
    updatedAt
    owner {
      displayName
    }
  }
}`

export default class VersionService {

  constructor (userId, articleId, sessionToken, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.sessionToken = sessionToken
    this.applicationConfig = applicationConfig
  }

  async createNewArticleVersion (major = false, message = '') {
    console.log(`Creating a new version on article id: ${this.articleId} (userId: ${this.userId})...`)
    return await askGraphQL(
      {
        query: createNewArticleVersionQuery,
        variables: {
          userId: this.userId,
          articleId: this.articleId,
          major,
          message
        }
      },
      `Creating a new version on article id: ${this.articleId} (userId: ${this.userId})`,
      this.sessionToken,
      this.applicationConfig
    )
  }
}
