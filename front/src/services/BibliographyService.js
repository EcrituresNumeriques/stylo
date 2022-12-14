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

  constructor (userId, articleId, runQuery) {
    this.userId = userId
    this.articleId = articleId
    this.runQuery = runQuery
  }

  async saveBibliography (bibliography) {
    return this.runQuery({
      query: saveBibliographyQuery,
      variables: {
        userId: this.userId,
        articleId: this.articleId,
        bibliography
      }
    })
  }
}
