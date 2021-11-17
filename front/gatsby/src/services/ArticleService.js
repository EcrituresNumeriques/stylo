import askGraphQL from "../helpers/graphQL"

const saveWorkingArticleTextQuery = `mutation($userId: ID!, $articleId: ID!, $text: String!) {
  updateArticle(
    article: $articleId,
    user: $userId,
    md: $text,
  ) { 
    updatedAt
  }
}`

export default class ArticleService {

  constructor (userId, articleId, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.applicationConfig = applicationConfig
  }

  async saveText (text) {
    return askGraphQL(
      {
        query: saveWorkingArticleTextQuery,
        variables: {
          userId: this.userId,
          articleId: this.articleId,
          text
        }
      },
      `Saving text on article id: ${this.articleId} (userId: ${this.userId})`,
      '',
      this.applicationConfig
    )
  }
}
