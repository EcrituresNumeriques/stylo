import { print } from 'graphql/language/printer'

import { applicationConfig } from '../config.js'
import { getSessionToken } from './sessionToken.js'

const corsStrategy = APP_ENVIRONMENT === 'prod' ? 'same-origin' : 'include'

/**
 * @typedef {import('graphql/language/ast').DocumentNode} DocumentNode
 */

/**
 * @param {object} config request configuration
 * @param {string} config.query request query (as string)
 * @param {'omit' | 'same-origin' | 'include'} config.credentials request query (as string)
 * @param {{[string: key]: value}|undefined} config.variables request variables
 * @returns {Promise<string|object>}
 */
async function executeRequest({ query, variables, credentials = 'omit' }) {
  const sessionToken = getSessionToken()
  const response = await fetch(applicationConfig.graphqlEndpoint, {
    method: 'POST',
    mode: 'cors',
    credentials,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Authorization header is provided only when we have a token
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  // GraphQL server always returns a 200/OK (even when there are one or more errors)
  if (!response.ok) {
    throw new ErrorResponse({
      statusText: response.statusText,
      status: response.status,
      //data: await response.text(),
    })
  }

  const body = await response.json()
  if (body.errors) {
    throw new GraphQLError(body.errors)
  }

  return body.data
}

export class ErrorResponse extends Error {
  constructor({ status, statusText, data }) {
    super()
    this.status = status
    this.statusText = statusText
    this.data = data
    // statusText is always empty with HTTP/2
    this.message = statusText || `HTTP ${status}`
  }
}

export class GraphQLError extends Error {
  constructor(errors) {
    super()
    this.errors = errors
    this.status = errors?.at(0).extensions?.http?.status || 400
    this.code = errors?.at(0).extensions?.code
    this.message = errors?.at(0).message
  }
}

export function useGraphQLClient() {
  return {
    query: ({ query, variables, withCredentials = false }) =>
      executeQuery({
        query,
        variables,
        credentials: withCredentials === false ? 'omit' : corsStrategy,
      }),
  }
}

/**
 * @param {object} context query context
 * @param {DocumentNode|string} context.query request query (as AST or string)
 * @param {'omit' | 'same-origin' | 'include'} context.credentials request variables
 * @param {{[key: string]: unknown}|undefined} context.variables request variables
 * @returns {Promise<string|{[key: string]: unknown}>}
 * @throws {Error} if something went wrong
 */
export function executeQuery({
  query: queryOrAST,
  variables,
  credentials = 'omit',
}) {
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
  return executeRequest({ query, variables, credentials })
}
