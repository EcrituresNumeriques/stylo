const Sentry = require('@sentry/node')
const { getOperationAST } = require('graphql')

const { logger } = require('../logger.js')
const { ExpectedError } = require('./errors.js')

/**
 * @typedef {import('graphql').GraphQLError} GraphQLError
 * @typedef {import('graphql').ExecutionArgs} ExecutionArgs
 * @typedef {import('graphql').ExecutionResult} ExecutionResult
 */

/**
 * Tells if an error of a GraphQL response is part of the normal behaviour of the API:
 * - an error of the request itself (invalid variables, unknown operation…), which has no path;
 * - a functional error thrown by a resolver, either typed with a code (`NOT_FOUND`, `NOT_AUTHORIZED`,
 *   `UNAUTHENTICATED`, `INVALID_INPUT`…) or marked as expected (`ExpectedError`).
 *
 * Anything else is a defect: an exception that a resolver did not foresee (database error, `TypeError`…)
 * or a value that does not match the schema (`null` in a non-null field, invalid scalar…).
 *
 * @param {GraphQLError} error
 * @returns {boolean}
 */
function isExpectedError(error) {
  if (!error.path) {
    return true
  }
  if (error.originalError instanceof ExpectedError) {
    return true
  }
  const { code, http } = error.extensions ?? {}
  return typeof code === 'string' && !(http?.status >= 500)
}

/**
 * @param {GraphQLError['path']} path
 * @returns {string} path of the field without the list indexes, e.g. `articles.contributors.user`
 */
function fieldName(path) {
  return path.filter((key) => typeof key === 'string').join('.')
}

/**
 * Reports to Sentry (and to the logs) the unexpected errors of a GraphQL response.
 *
 * graphql-js catches the exceptions thrown by the resolvers and adds them to the `errors` of the response,
 * so they never reach the error handlers of Express and Sentry.
 * This function never throws: reporting an error must not make the request fail.
 *
 * @param {ExecutionArgs} args
 * @param {ExecutionResult} result
 * @returns {void}
 */
function reportExecutionErrors(args, result) {
  try {
    const errors = (result?.errors ?? []).filter(
      (error) => !isExpectedError(error)
    )
    if (errors.length === 0) {
      return
    }

    const operation = getOperationAST(args.document, args.operationName)
    const operationName =
      operation?.name?.value ?? args.operationName ?? undefined
    const operationType = operation?.operation

    for (const error of errors) {
      const field = fieldName(error.path)
      logger.error(
        { err: error.originalError ?? error, operationName, field },
        'Unexpected error in a GraphQL resolver'
      )
      // the original error holds the stack trace of the resolver
      Sentry.captureException(error.originalError ?? error, {
        tags: {
          'graphql.operation.name': operationName,
          'graphql.operation.type': operationType,
          'graphql.field': field,
        },
        contexts: {
          graphql: {
            operationName,
            operationType,
            path: error.path.join('.'),
            message: error.message,
          },
        },
      })
    }
  } catch (err) {
    logger.error({ err }, 'Unable to report the errors of a GraphQL response')
  }
}

module.exports = { isExpectedError, reportExecutionErrors }
