import { executeQuery } from './graphQL.js'

import { getFullUserProfile as getUserProfileQuery } from '../hooks/Credentials.graphql'

/**
 * @param {object} sessionToken
 * @param {string} sessionToken.sessionToken
 * @returns {Promise<object>}
 */
export function getUserProfile({ sessionToken }) {
  return executeQuery({ sessionToken, query: getUserProfileQuery })
}
