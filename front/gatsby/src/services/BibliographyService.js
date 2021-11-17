import askGraphQL from "../helpers/graphQL"

const saveBibliographyQuery = `mutation($userId: ID!, $articleId: ID!, $bibliography: String!) {
  updateWorkingVersion(
    article: $articleId,
    user: $userId,
    bib: $bibliography,
  ) {
    updatedAt
  }
}`

export default class BibliographyService {

  constructor (userId, articleId, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.applicationConfig = applicationConfig
  }

  async saveBibliography (bibliography) {
    return askGraphQL(
      {
        query: saveBibliographyQuery,
        variables: {
          userId: this.userId,
          articleId: this.articleId,
          bibliography
        }
      },
      `Saving bibliography on article id: ${this.articleId} (userId: ${this.userId})`,
      '',
      this.applicationConfig
    )
  }
}
