import { print } from 'graphql/language/printer'
import { useSelector } from 'react-redux'
import useSWR, { useSWRConfig } from 'swr'
import { executeQuery } from '../helpers/graphQL.js'

/**
 * @typedef {import('graphql/language/ast').ASTNode} ASTNode
 * @typedef {import('swr/_internal').SWRConfiguration} SWRConfiguration
 * @typedef {import('swr/_internal').SWRResponse} SWRResponse
 */

/**
 * Fetch data using SWR.
 * @param {object} config config
 * @param {string|ASTNode} config.query GraphQL query
 * @param {{[key : string]: any}} config.variables query arguments
 * @param {SWRConfiguration} [options] - SWR options (optional)
 * @returns {SWRResponse}
 */
export default function useFetchData(
  { query: queryOrAST, variables },
  options
) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const query = resolveQuery(queryOrAST)
  return useSWR({ query, variables, sessionToken }, fetch, options)
}

/**
 * Fetch data conditionally using SWR.
 * @param {object | Function} param config
 * @param {SWRConfiguration} [options] - SWR options (optional)
 * @returns {SWRResponse}
 */
export function useConditionalFetchData(param, options) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const resolvedKey = resolveKey(param, sessionToken)
  return useSWR(resolvedKey, fetch, options)
}

function resolveKey(param, sessionToken) {
  return typeof param === 'function'
    ? resolveKeyFunction(param, sessionToken)
    : resolveKeyParam(param, sessionToken)
}

function resolveKeyParam(param, sessionToken) {
  if (param) {
    return {
      query: resolveQuery(param.query),
      variables: param.variables,
      sessionToken,
    }
  }
  return null
}

function resolveKeyFunction(fn, sessionToken) {
  const value = fn()
  if (value) {
    return {
      query: resolveQuery(value.query),
      variables: value.variables,
      sessionToken,
    }
  }
  return null
}

function resolveQuery(queryOrAST) {
  return typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
}

/**
 * Return a mutate function that mutates data associated to a given query + variables.
 * This function relies on https://swr.vercel.app/docs/mutation#mutate.
 * @param {object} config config
 * @param {string|ASTNode} config.query GraphQL query
 * @param {{[key : string]: any}|undefined} config.variables query arguments
 * @returns {{mutate: (function(function(any): Promise, any?): Promise<any>)}}
 */
export function useMutateData({ query, variables }) {
  const { mutate } = useSWRConfig()
  const key = useSWRKey({ query, variables })
  return {
    mutate: async (mutationCallback, options) =>
      await mutate(key, mutationCallback, options),
  }
}

/**
 * @param {object} config config
 * @param {string|ASTNode} config.query GraphQL query
 * @param {{[key : string]: any}} config.variables query arguments
 * @returns {{query: string, variables: {[key : string]: any}, sessionToken: string}} an SWR key
 */
function useSWRKey({ query: queryOrAST, variables }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const query = resolveQuery(queryOrAST)
  return { query, variables, sessionToken }
}

async function fetch({ query, variables, sessionToken }) {
  return executeQuery({
    query,
    variables,
    sessionToken,
    type: 'fetch',
  })
}
