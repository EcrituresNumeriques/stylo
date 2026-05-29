import { getFullUserProfile as getUserProfileQuery } from '../hooks/Credentials.graphql'
import { executeQuery } from './graphQL.js'

/**
 * @param {object} sessionToken
 * @param {string} sessionToken.sessionToken
 * @returns {Promise<object>}
 */
export function getUserProfile({ sessionToken }) {
  return executeQuery({ sessionToken, query: getUserProfileQuery })
}
