import askGraphQL from "../helpers/graphQL"

const saveWorkingVersionMetadataQuery = `mutation($userId: ID!, $articleId: ID!, $metadata: String!) {
  updateArticle(
    article: $articleId,
    user: $userId,
    bib: $metadata
  ) {
    updatedAt
  }
}`

export default class MetadataService {

  constructor (userId, articleId, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.applicationConfig = applicationConfig
  }

  async saveMetadata (metadata) {
    return askGraphQL(
      {
        query: saveWorkingVersionMetadataQuery,
        variables: {
          userId: this.userId,
          articleId: this.articleId,
          metadata
        }
      },
      `Saving metadata on article id: ${this.articleId} (userId: ${this.userId})`,
      '',
      this.applicationConfig
    )
  }
}
