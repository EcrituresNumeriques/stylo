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

class BadRequestError extends GraphQLError {
  constructor (code = 'BAD_REQUEST', message = 'Unable to process the query/mutation.') {
    super(message, {
      extensions: {
        code,
        http: { status: 400 }
      }
    })
  }
}

class NotAuthenticatedError extends GraphQLError {
  constructor () {
    super('Unable to find an authentication context.', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 }
      }
    })
  }
}

class NotAuthorizedError extends GraphQLError {
  constructor () {
    super('Resource access not authorized.', {
      extensions: {
        code: 'NOT_AUTHORIZED',
        http: { status: 403 }
      }
    })
  }
}

class NotFoundError extends GraphQLError {
  /**
   * @param {string} type
   * @param {string} id
   */
  constructor (type, id) {
    super(`Unable to find resource ${type} #${id}.`, {
      extensions: {
        code: 'NOT_FOUND',
        http: { status: 404 },
        resource: { type, id }
      }
    })
  }
}


module.exports = {
  ApiError,
  BadRequestError,
  NotAuthenticatedError,
  NotAuthorizedError,
  NotFoundError
}
