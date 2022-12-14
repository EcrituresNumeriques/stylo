import askGraphQL from "../helpers/graphQL"

const saveWorkingVersionMetadataQuery = `mutation($userId: ID!, $articleId: ID!, $metadata: String!) {
  updateWorkingVersion(
    article: $articleId,
    user: $userId,
    yaml: $metadata
  ) {
    updatedAt
  }
}`

export default class MetadataService {

  constructor (userId, articleId, sessionToken, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.sessionToken = sessionToken
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
      this.sessionToken,
      this.applicationConfig
    )
  }
}
