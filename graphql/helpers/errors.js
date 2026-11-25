const { GraphQLError } = require('graphql')

class ApiError extends Error {
  constructor(type, ...errors) {
    super(...errors)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }

    this.extensions = {
      date: new Date(),
      type,
      errors,
    }
  }
}

/**
 * Functional error thrown by the resolvers written before the typed errors below.
 * It is sent to the client like a plain `Error` (same message, no code), so the API responses are unchanged,
 * but it is not reported as an unexpected error (see `helpers/errorReporting.js`).
 *
 * @deprecated New code must throw one of the typed errors below.
 */
class ExpectedError extends Error {}

class BadRequestError extends GraphQLError {
  constructor(
    code = 'BAD_REQUEST',
    message = 'Unable to process the query/mutation.'
  ) {
    super(message, {
      extensions: {
        code,
        http: { status: 400 },
      },
    })
  }
}

class NotAuthenticatedError extends GraphQLError {
  constructor() {
    super('Unable to find an authentication context.', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    })
  }
}

class NotAuthorizedError extends GraphQLError {
  constructor() {
    super('Resource access not authorized.', {
      extensions: {
        code: 'NOT_AUTHORIZED',
        http: { status: 403 },
      },
    })
  }
}

class NotFoundError extends GraphQLError {
  /**
   * @param {string} type
   * @param {string} id
   */
  constructor(type, id) {
    super(`Unable to find resource ${type} #${id}.`, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
        resource: { type, id },
      },
    })
  }
}

module.exports = {
  ApiError,
  BadRequestError,
  ExpectedError,
  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError,
}
