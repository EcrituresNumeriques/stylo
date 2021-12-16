const { gql, GraphQLClient } = require('graphql-request')
const { FindByIdNotFoundError } = require('./helpers/errors')
const jwt = require('jsonwebtoken')

const graphqlEndpoint = process.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3030/graphql'
const jwtSecret = process.env.JWT_SECRET_SESSION_COOKIE

const passthroughToken = jwt.sign({
  admin: true,
  roles: ['read'],
  readonly: true
}, jwtSecret)

const client = new GraphQLClient(graphqlEndpoint, {
  headers: {
    authorization: `Bearer ${passthroughToken}`,
  },
})

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
    const { article } = await client.request(query, { articleId })
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
    const { version } = await client.request(query, { versionId })
    return version
  }
  catch (e) {
    throw new FindByIdNotFoundError('Version', versionId)
  }
}

async function getBookById (bookId) {
  // const book = await Tag.findById(bookId)

  if (!book) {
    throw new FindByIdNotFoundError('Book', bookId)
  }

  return book
}

module.exports = {
  getArticleById,
  getBookById,
  getVersionById,
}
