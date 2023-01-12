const { gql, GraphQLClient, ClientError } = require('graphql-request')
const { FindByIdNotFoundError } = require('./helpers/errors')
const { logger } = require('./logger')

let graphQLClient = null

function isNotFoundError (err) {
  if (err instanceof ClientError) {
    if (err.response.errors) {
      return err.response.errors[0]?.extensions?.type === 'NOT_FOUND'
    }
  }
  return false
}

function getGraphQLClient () {
  if (graphQLClient) {
    return graphQLClient
  }
  const graphqlEndpoint = process.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3030/graphql'
  const passthroughToken = process.env.SE_GRAPHQL_TOKEN
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
        yamlReformated
        md
      }
    }
  }`

  try {
    const { article } = await getGraphQLClient().request(query, { articleId })
    return article
  } catch (err) {
    if (isNotFoundError(err)) {
      throw new FindByIdNotFoundError('Article', articleId)
    }
    logger.error({ articleId, error: err }, 'Something went wrong while querying article by id using GraphQL client')
    throw err
  }
}

async function getVersionById (versionId) {
  const query = gql`query ($versionId: ID!) {
    version (version:$versionId) {
      _id
      bib
      yamlReformated
      md
    }
  }`

  try {
    const { version } = await getGraphQLClient().request(query, { versionId })
    return version
  } catch (err) {
    if (isNotFoundError(err)) {
      throw new FindByIdNotFoundError('Version', versionId)
    }
    logger.error({ versionId, error: err }, 'Something went wrong while querying version by id using GraphQL client')
    throw err
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
          yamlReformated
        }

        workingVersion {
          md
          bib
          yamlReformated
        }
      }
    }
  }`

  try {
    const { tag: book } = await getGraphQLClient().request(query, { bookId })
    return book
  } catch (err) {
    if (isNotFoundError(err)) {
      throw new FindByIdNotFoundError('Book', bookId)
    }
    logger.error({ bookId, error: err }, 'Something went wrong while querying book by id using GraphQL client')
    throw err
  }
}

module.exports = {
  getArticleById,
  getBookById,
  getVersionById,
}
