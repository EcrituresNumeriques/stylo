import askGraphQL from "../helpers/graphQL";

const addAcquintanceQuery = `mutation($user: ID!, $email: String!) {
  addAcquintance(email: $email, user: $user) { _id }
}`

const shareArticleQuery = `mutation($user: ID!, $article: ID!, $to: ID!) {
  shareArticle(article: $article, to: $to, user: $user) { _id }
}`

const unshareArticleQuery = `mutation($user: ID!, $article: ID!, $to: ID!) {
  unshareArticle(article: $article, to: $to, user: $user) { _id }
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
      user
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
      user
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
      user
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

  async getAcquintancesAndPermissions () {
    return askGraphQL(
      { query: getAcquintancesPermissionsQuery, variables: { user: this.userId } },
      'Fetching acquintances and permissions',
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

  async grantAccountAccessTo ({ from, to }) {
    return askGraphQL(
      { query: grantAccountAccessQuery, variables: { from, to } },
      'Grand account access',
      '',
      this.applicationConfig
    )
  }

  async revokeAccountAccessTo ({ from, to }) {
    return askGraphQL(
      { query: revokeAccountAccessQuery, variables: { from, to } },
      'Grand account access',
      '',
      this.applicationConfig
    )
  }

  async duplicateArticle (articleId, to) {
    return askGraphQL(
      {
        query: duplicateArticleQuery,
        variables: {
          user: this.userId,
          to,
          article: articleId,
        }
      },
      'Duplicating article',
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

  async unshareArticle (articleId, to) {
    return askGraphQL(
      {
        query: unshareArticleQuery,
        variables: {
          user: this.userId,
          to,
          article: articleId,
        }
      },
      'Unsharing article',
      '',
      this.applicationConfig
    )
  }
}
