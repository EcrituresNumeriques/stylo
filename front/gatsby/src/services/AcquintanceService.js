import askGraphQL from "../helpers/graphQL";

const addAcquintanceQuery = `mutation($user: ID!, $email: String!) {
  addAcquintance(email: $email, user: $user) { _id }
}`

const shareArticleQuery = `mutation($user: ID!, $article: ID!, $to: ID!) {
  shareArticle(article: $article, to: $to, user: $user) { _id }
}`

const sendArticleQuery = `mutation($user: ID!, $article: ID!, $to: ID!) {
  sendArticle(article: $article, to: $to, user: $user) { _id }
}`

const getAcquintancesQuery = `query($user: ID!) {
  user(user: $user) {
    acquintances {
      _id
      displayName
      email
    }
  }
}`

export default class AcquintanceService {

  constructor (userId, applicationConfig) {
    this.userId = userId
    this.applicationConfig = applicationConfig
  }

  async getAcquintances () {
    return askGraphQL(
      { query: getAcquintancesQuery, variables: { user: this.userId } },
      'Fetching acquintances',
      '',
      this.applicationConfig
    )
  }

  async addAcquintance (contact) {
    return askGraphQL(
      { query: addAcquintanceQuery, variables: { user: this.userId, email: contact } },
      'Adding acquintances',
      '',
      this.applicationConfig
    )
  }

  async sendArticle (articleId, to) {
    return askGraphQL(
      {
        query: sendArticleQuery,
        variables: {
          user: this.userId,
          to,
          article: articleId,
        }
      },
      'Sending article',
      '',
      this.applicationConfig
    )
  }

  async shareArticle (articleId, to) {
    return askGraphQL(
      {
        query: shareArticleQuery,
        variables: {
          user: this.userId,
          to,
          article: articleId,
        }
      },
      'Sharing article',
      '',
      this.applicationConfig
    )
  }
}
