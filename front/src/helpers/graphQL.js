import { print } from 'graphql/language/printer'
import { useSelector } from 'react-redux'
import { applicationConfig } from '../config.js'

/**
 * @typedef {import('graphql/language/ast').DocumentNode} DocumentNode
 */

/**
 * @param {object} config request configuration
 * @param {string} config.query request query (as string)
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
}) {
  const response = await fetch(applicationConfig.graphqlEndpoint, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
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
    const { status, statusText } = response
    throw new Response(response.body, { status, statusText })
  }

  const body = await response.json()

  if (Array.isArray(body.errors) && body.errors.length) {
    const errorMessage =
      type === 'fetch'
        ? 'Something wrong happened while fetching data.'
        : 'Something wrong happened while mutating data.'

    throw new Response(errorMessage, { data: body.errors })
  }

  return body.data
}

export function useGraphQLClient() {
  const sessionToken = useSelector((state) => state.sessionToken)
  return {
    query: ({ query, variables }) =>
      executeQuery({ query, variables, sessionToken }),
  }
}

/**
 * @param {object} context query context
 * @param {DocumentNode|string} context.query request query (as AST or string)
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
  type = 'fetch',
}) {
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
  return executeRequest({ query, variables, sessionToken, type })
}
