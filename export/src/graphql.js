const { gql, GraphQLClient } = require('graphql-request')
const { FindByIdNotFoundError } = require('./helpers/errors')

let graphQLClient = null

function getGraphQLClient () {
  if (graphQLClient) {
    return graphQLClient
  }
  const graphqlEndpoint = process.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3030/graphql'
  const passthroughToken = require('jsonwebtoken').sign({
    admin: true,
    roles: ['read'],
    readonly: true
  }, process.env.JWT_SECRET_SESSION_COOKIE)
  graphQLClient = new GraphQLClient(graphqlEndpoint, {
    headers: {
      authorization: `Bearer ${passthroughToken}`,
    },
  })
  return graphQLClient
}

async function getArticleById (articleId) {
  const query = gql`query ($articleId: ID!) {
    article (article:$articleId) {
      _id
      title

      workingVersion {
        bib
        yaml
        md
      }
    }
  }`

  try {
    const { article } = await getGraphQLClient().request(query, { articleId })
    return article
  }
  catch (e) {
    console.error(e)
    throw new FindByIdNotFoundError('Article', articleId)
  }
}

async function getVersionById (versionId) {
  const query = gql`query ($versionId: ID!) {
    version (version:$versionId) {
      _id
      bib
      yaml
      md
    }
  }`

  try {
    const { version } = await getGraphQLClient().request(query, { versionId })
    return version
  }
  catch (e) {
    throw new FindByIdNotFoundError('Version', versionId)
  }
}

async function getBookById (bookId) {
  const query = gql`query ($bookId: ID!) {
    tag (tag:$bookId) {
      _id
      name

      articles {
        _id
        versions (limit: 1) {
          name

          md
          bib
          yaml
        }
      }
    }
  }`

  try {
    const { tag: book } = await getGraphQLClient().request(query, { bookId })
    return book
  }
  catch (e) {
    console.error(e)
    throw new FindByIdNotFoundError('Book', bookId)
  }

  return book
}

module.exports = {
  getArticleById,
  getBookById,
  getVersionById,
}
