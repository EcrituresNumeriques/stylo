import { print } from 'graphql/language/printer'
import { useSelector } from 'react-redux'
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

  if (!response.ok) {
    throw new Response(response.statusText, {
      status: response.status
    })
  }

  const body = await response.json()
  if (body.errors) {
    const error = body.errors.at(0)

    throw new Response(error?.extensions?.code, {
      status: error?.extensions?.http?.status,
      statusText: error.message
    })
  }

  return body.data
}

export function useGraphQLClient() {
  const sessionToken = useSelector((state) => state.sessionToken)
  return {
    query: ({ query, variables, type = 'fetch', withCredentials = false }) =>
      executeQuery({
        query,
        variables,
        sessionToken,
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
 * @param {string} context.sessionToken session token (for authentication)
 * @param {'fetch'|'mutate'} context.type request type (either fetch or mutate)
 * @returns {Promise<string|{[key: string]: any}>}
 * @throws Error if something went wrong
 */
export function executeQuery({
  query: queryOrAST,
  variables,
  sessionToken,
  credentials = 'omit',
  type = 'fetch',
}) {
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
  return executeRequest({ query, variables, sessionToken, type, credentials })
}
