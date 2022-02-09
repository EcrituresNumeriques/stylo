const addAcquintanceQuery = `mutation($user: ID!, $email: String!) {
  addAcquintance(email: $email, user: $user) { _id }
}`

const shareArticleQuery = `mutation($user: ID!, $article: ID!, $to: ID!) {
  shareArticle(article: $article, to: $to, user: $user) {
    _id
    contributors {
      roles
      user {
        _id
        displayName
      }
    }
  }
}`

const unshareArticleQuery = `mutation($user: ID!, $article: ID!, $to: ID!) {
  unshareArticle(article: $article, to: $to, user: $user) {
    _id
    contributors {
      roles
      user {
        _id
        displayName
      }
    }
  }
}`

const duplicateArticleQuery = `mutation($user: ID!, $article: ID!, $to: ID!) {
  duplicateArticle(article: $article, to: $to, user: $user) { _id }
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

const getAcquintancesPermissionsQuery = `query($user: ID!) {
  user(user: $user) {
    permissions {
      scope
      user {
        _id
        displayName
        email
      }
      roles
    }
    acquintances {
      _id
      displayName
      email
    }
  }
}`


const grantAccountAccessQuery = `mutation($from: ID!, $to: ID!) {
  grantAccountAccess(user: $from, to: $to) {
    permissions {
      scope
      user {
        _id
        displayName
        email
      }
      roles
    }
    acquintances {
      _id
      displayName
      email
    }
  }
}`

const revokeAccountAccessQuery = `mutation($from: ID!, $to: ID!) {
  revokeAccountAccess(user: $from, to: $to) {
    permissions {
      scope
      user {
        _id
        displayName
        email
      }
      roles
    }
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

  async getAcquintancesAndPermissions () {
    return this.runQuery({
      query: getAcquintancesPermissionsQuery,
      variables: { user: this.userId }
    })
  }

  async addAcquintance (contact) {
    return this.runQuery({
      query: addAcquintanceQuery,
      variables: { user: this.userId, email: contact }
    })
  }

  async grantAccountAccessTo ({ from, to }) {
    return this.runQuery({
      query: grantAccountAccessQuery,
      variables: { from, to }
    })
  }

  async revokeAccountAccessTo ({ from, to }) {
    return this.runQuery({
      query: revokeAccountAccessQuery,
      variables: { from, to }
    })
  }

  async duplicateArticle (articleId, to) {
    return this.runQuery({
      query: duplicateArticleQuery,
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
