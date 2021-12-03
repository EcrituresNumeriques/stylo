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

  constructor (userId, runQuery) {
    this.userId = userId
    this.runQuery = runQuery
  }

  async getAcquintances () {
    return this.runQuery({
      query: getAcquintancesQuery,
      variables: { user: this.userId }
    })
  }

  async addAcquintance (contact) {
    return this.runQuery({
      query: addAcquintanceQuery,
      variables: { user: this.userId, email: contact }
    })
  }

  async sendArticle (articleId, to) {
    return this.runQuery({
        query: sendArticleQuery,
        variables: {
          user: this.userId,
          to,
          article: articleId,
        }
      })
  }

  async shareArticle (articleId, to) {
    return this.runQuery({
        query: shareArticleQuery,
        variables: {
          user: this.userId,
          to,
          article: articleId,
        }
      })
  }

  async unshareArticle (articleId, to) {
    return this.runQuery({
      query: unshareArticleQuery,
      variables: {
        user: this.userId,
        to,
        article: articleId,
      }
    })
  }
}
