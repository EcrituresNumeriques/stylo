const { gql, GraphQLClient, ClientError } = require('graphql-request')
const { FindByIdNotFoundError } = require('./helpers/errors')
const { logger } = require('./logger')
const config = require('./config.js')

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
  const graphqlEndpoint = config.get('api.urlEndpoint')
  const passthroughToken = config.get('api.passthroughToken')

  graphQLClient = new GraphQLClient(graphqlEndpoint, {
    headers: {
      authorization: `Bearer ${passthroughToken}`,
    },
  })
  return graphQLClient
}

async function getArticleById (articleId) {
  const query = gql`query ($articleId: ID!) {
    article (article: $articleId) {
      _id
      title

      workingVersion {
        bib
        yaml (options: { strip_markdown: true })
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
      yaml (options: { strip_markdown: true })
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

async function getCorpusById (corpusId) {
  const query = gql`mutation ($corpusId: ID!) {
    corpus(corpusId: $corpusId) {
      _id
      name
      articles {
        order
        article {
          _id
          versions (limit: 1) {
            name
            md
            bib
            yaml (options: { strip_markdown: true })
          }
          workingVersion {
            md
            bib
            yaml (options: { strip_markdown: true })
          }
        }
      }
    }
  }`

  try {
    const { corpus } = await getGraphQLClient().request(query, { corpusId })
    return corpus
  } catch (err) {
    if (isNotFoundError(err)) {
      throw new FindByIdNotFoundError('Corpus', corpusId)
    }
    logger.error({ corpusId, error: err }, 'Something went wrong while querying a corpus by id using GraphQL client')
    throw err
  }
}

module.exports = {
  getArticleById,
  getCorpusById,
  getVersionById,
}
