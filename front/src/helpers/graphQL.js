import { useSelector } from 'react-redux'
import { print } from 'graphql/language/printer'
import { applicationConfig } from '../config.js'

/**
 * @typedef {import('graphql/language/ast').DocumentNode} DocumentNode
 */

export default async function askGraphQL(payload, sessionToken = null) {
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
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const { status, statusText } = response
    throw new Response(response.body, { status, statusText })
  }

  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

export function useGraphQL() {
  const sessionToken = useSelector((state) => state.sessionToken)
  return runQuery.bind(null, { sessionToken })
}

/**
 * @param {string} sessionToken
 * @param {DocumentNode|string} queryOrAST
 * @param {{[string: key]: value}} variables
 * @returns {Promise<string|object>}
 */
export function runQuery({ sessionToken }, { query: queryOrAST, variables }) {
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
  return askGraphQL({ query, variables }, sessionToken)
}
