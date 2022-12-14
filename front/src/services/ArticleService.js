import askGraphQL from "../helpers/graphQL"

const saveWorkingVersionTextQuery = `mutation($userId: ID!, $articleId: ID!, $text: String!) {
  updateWorkingVersion(
    article: $articleId,
    user: $userId,
    md: $text,
  ) {
    updatedAt
  }
}`

export default class ArticleService {

  constructor (userId, articleId, sessionToken, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.sessionToken = sessionToken
    this.applicationConfig = applicationConfig
  }

  async saveText (text) {
    return askGraphQL(
      {
        query: saveWorkingVersionTextQuery,
        variables: {
          userId: this.userId,
          articleId: this.articleId,
          text
        }
      },
      `Saving text on article id: ${this.articleId} (userId: ${this.userId})`,
      this.sessionToken,
      this.applicationConfig
    )
  }
}
