import { print } from 'graphql/language/printer'
import { useSelector } from 'react-redux'
import { applicationConfig } from '../config.js'

/**
 * @typedef {import('graphql/language/ast').DocumentNode} DocumentNode
 */

async function getErrorResponse(response) {
  try {
    return await response.clone().json()
  } catch (err) {
    const responseText = await response.clone().text()
    return {
      errors: [
        {
          message: responseText,
        },
      ],
    }
  }
}

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
    const errorResponse = await getErrorResponse(response)
    console.error(
      `Something wrong happened during ${type} => ${response.status}, ${
        response.statusText
      }: ${JSON.stringify(errorResponse)}`
    )
    const errorMessage =
      errorResponse && errorResponse.errors && errorResponse.errors.length
        ? errorResponse.errors[0].message
        : 'Unexpected error!'
    const error = new Error(errorMessage)
    error.messages = errorResponse?.errors ?? [errorMessage]
    throw error
  }

  const body = await response.json()
  if (body.errors) {
    const errorMessage =
      type === 'fetch'
        ? 'Something wrong happened while fetching data.'
        : 'Something wrong happened while mutating data.'
    const error = new Error(errorMessage)
    error.messages = body.errors
    throw error
  }
  return body.data
}

export function useGraphQLClient() {
  const sessionToken = useSelector((state) => state.sessionToken)
  return {
    query: ({ query, variables, type = 'fetch' }) =>
      executeQuery({ query, variables, sessionToken, type }),
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
