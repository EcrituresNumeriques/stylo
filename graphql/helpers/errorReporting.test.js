const { after, beforeEach, describe, mock, test } = require('node:test')
const assert = require('node:assert')
const Sentry = require('@sentry/node')
const { graphql, parse } = require('graphql')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const { logger } = require('../logger.js')
const {
  BadRequestError,
  ExpectedError,
  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError,
} = require('./errors.js')
const {
  isExpectedError,
  reportExecutionErrors,
} = require('./errorReporting.js')

const unexpectedError = new TypeError(
  "Cannot read properties of null (reading 'title')"
)

const schema = makeExecutableSchema({
  typeDefs: `
    type Item {
      id: ID!
      crash: String
    }
    type Query {
      ok: String
      notFound: String
      notAuthorized: String
      notAuthenticated: String
      badRequest: String
      legacy: String
      crash: String
      nullInNonNull: String!
      items: [Item!]!
      withArgument(limit: Int!): String
    }
  `,
  resolvers: {
    Query: {
      ok: () => 'ok',
      notFound: () => {
        throw new NotFoundError('Article', '42')
      },
      notAuthorized: () => {
        throw new NotAuthorizedError()
      },
      notAuthenticated: () => {
        throw new NotAuthenticatedError()
      },
      badRequest: () => {
        throw new BadRequestError(
          'INVALID_INPUT',
          'Argument "input" is required.'
        )
      },
      legacy: () => {
        throw new ExpectedError('Old password is incorrect')
      },
      crash: () => {
        throw unexpectedError
      },
      nullInNonNull: () => null,
      items: () => [{ id: '1' }, { id: '2' }],
      withArgument: () => 'ok',
    },
    Item: {
      crash: (item) => {
        if (item.id === '2') {
          throw unexpectedError
        }
        return 'ok'
      },
    },
  },
})

/**
 * Executes a query through the schema, then reports its errors like the GraphQL handler does.
 *
 * @param {string} source
 * @param {object} [variableValues]
 * @returns {Promise<import('graphql').ExecutionResult>}
 */
async function executeAndReport(source, variableValues) {
  const result = await graphql({ schema, source, variableValues })
  reportExecutionErrors(
    { schema, document: parse(source), variableValues },
    result
  )
  return result
}

describe('error reporting', () => {
  const captureException = mock.method(Sentry, 'captureException', () => 'id')
  const logError = mock.method(logger, 'error', () => {})

  beforeEach(() => {
    captureException.mock.resetCalls()
    logError.mock.resetCalls()
  })

  after(() => {
    mock.restoreAll()
  })

  describe('expected errors', () => {
    for (const field of [
      'notFound',
      'notAuthorized',
      'notAuthenticated',
      'badRequest',
      'legacy',
    ]) {
      test(`does not report the functional error of "${field}"`, async () => {
        const result = await executeAndReport(`query { ${field} }`)

        assert.equal(result.errors.length, 1)
        assert.equal(isExpectedError(result.errors[0]), true)
        assert.equal(captureException.mock.callCount(), 0)
        assert.equal(logError.mock.callCount(), 0)
      })
    }

    test('does not report invalid variables', async () => {
      const result = await executeAndReport(
        'query ($limit: Int!) { withArgument(limit: $limit) }',
        { limit: 'ten' }
      )

      assert.equal(result.errors.length, 1)
      assert.equal(captureException.mock.callCount(), 0)
    })

    test('does nothing when the response has no error', async () => {
      const result = await executeAndReport('query { ok }')

      assert.equal(result.errors, undefined)
      assert.equal(captureException.mock.callCount(), 0)
    })

    test('keeps the response of a legacy error unchanged', async () => {
      const result = await executeAndReport('query { legacy }')

      assert.deepEqual(result.errors[0].toJSON(), {
        message: 'Old password is incorrect',
        locations: [{ line: 1, column: 9 }],
        path: ['legacy'],
      })
    })
  })

  describe('unexpected errors', () => {
    test('reports the exception thrown by a resolver', async () => {
      await executeAndReport('query GetCrash { crash }')

      assert.equal(captureException.mock.callCount(), 1)
      const [error, hint] = captureException.mock.calls[0].arguments
      // the original error, with the stack trace of the resolver
      assert.equal(error, unexpectedError)
      assert.deepEqual(hint.tags, {
        'graphql.operation.name': 'GetCrash',
        'graphql.operation.type': 'query',
        'graphql.field': 'crash',
      })
      assert.equal(hint.contexts.graphql.path, 'crash')
      assert.equal(logError.mock.callCount(), 1)
    })

    test('reports a null value in a non-null field', async () => {
      await executeAndReport('query { nullInNonNull }')

      assert.equal(captureException.mock.callCount(), 1)
      const [error, hint] = captureException.mock.calls[0].arguments
      assert.match(error.message, /Cannot return null for non-nullable field/)
      assert.equal(hint.tags['graphql.field'], 'nullInNonNull')
    })

    test('groups the items of a list under the same field', async () => {
      await executeAndReport('query { items { id crash } }')

      assert.equal(captureException.mock.callCount(), 1)
      const [, hint] = captureException.mock.calls[0].arguments
      assert.equal(hint.tags['graphql.field'], 'items.crash')
      assert.equal(hint.contexts.graphql.path, 'items.1.crash')
    })

    test('reports only the unexpected errors of a response', async () => {
      const result = await executeAndReport('query { notFound crash ok }')

      assert.equal(result.errors.length, 2)
      assert.equal(captureException.mock.callCount(), 1)
      assert.equal(captureException.mock.calls[0].arguments[0], unexpectedError)
    })

    test('reports an error with a 5xx status even if it has a code', async () => {
      const error = new BadRequestError('UPSTREAM_FAILURE', 'Upstream failure')
      error.extensions.http.status = 502
      error.path = ['crash']

      assert.equal(isExpectedError(error), false)
    })
  })

  test('never throws', () => {
    captureException.mock.mockImplementationOnce(() => {
      throw new Error('Sentry is broken')
    })
    const error = Object.assign(new Error('Boom'), { path: ['crash'] })

    assert.doesNotThrow(() =>
      reportExecutionErrors(
        { schema, document: parse('query { crash }') },
        { errors: [error] }
      )
    )
  })
})
