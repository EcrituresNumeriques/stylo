import { print } from 'graphql/language/printer'

import { applicationConfig } from '../config.js'

const corsStrategy = APP_ENVIRONMENT === 'prod' ? 'same-origin' : 'include'

/**
 * @typedef {import('graphql/language/ast').DocumentNode} DocumentNode
 */

/**
 * @param {object} config request configuration
 * @param {string} config.query request query (as string)
 * @param {'omit' | 'same-origin' | 'include'} config.credentials request query (as string)
 * @param {{[string: key]: value}|undefined} config.variables request variables
 * @param {string} config.sessionToken session token (for authentication)
 * @param {'fetch'|'mutate'} config.type request type (either fetch or mutate)
 * @returns {Promise<string|object>}
 */
async function executeRequest({
  query,
  variables,
  sessionToken,
  type = 'fetch',
  credentials = 'omit',
}) {
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
    this.message = statusText
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
    query: ({ query, variables, type = 'fetch', withCredentials = false }) =>
      executeQuery({
        query,
        variables,
        type,
        credentials: withCredentials === false ? 'omit' : corsStrategy,
      }),
  }
}

/**
 * @param {object} context query context
 * @param {DocumentNode|string} context.query request query (as AST or string)
 * @param {'omit' | 'same-origin' | 'include'} context.credentials request variables
 * @param {{[string: key]: any}|undefined} context.variables request variables
 * @param {'fetch'|'mutate'} context.type request type (either fetch or mutate)
 * @returns {Promise<string|{[key: string]: any}>}
 * @throws Error if something went wrong
 */
export function executeQuery({
  query: queryOrAST,
  variables,
  credentials = 'omit',
  type = 'fetch',
}) {
  const sessionToken = localStorage.getItem('sessionToken')
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
  return executeRequest({ query, variables, sessionToken, type, credentials })
}
