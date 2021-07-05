import askGraphQL from "../helpers/graphQL"

const saveBibTeXQuery = `mutation($userId: ID!, $articleId: ID!, $bib: String!) {
  saveVersion(version: {
      article: $articleId,
      major: false,
      auto: true,
      bib: $bib,
      message: ""
    },
    user: $userId
  ) { 
    _id
  }
}`

export default class BibliographyService {

  constructor (userId, articleId, applicationConfig) {
    this.userId = userId
    this.articleId = articleId
    this.applicationConfig = applicationConfig
  }

  async saveBibTeX (bibTeX) {
    return askGraphQL(
      { query: saveBibTeXQuery, variables: { userId: this.userId, articleId: this.articleId, bib: bibTeX } },
      `Saving BibTeX on article id: ${this.articleId} (userId: ${this.userId})`,
      '',
      this.applicationConfig
    )
  }
}
