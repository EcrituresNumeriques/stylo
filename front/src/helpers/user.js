import { executeQuery } from './graphQL.js'

import { getFullUserProfile as getUserProfileQuery } from '../hooks/Credentials.graphql'

/**
 * @param sessionToken
 * @return {Promise<object>}
 */
export function getUserProfile({ sessionToken }) {
  return executeQuery({ sessionToken, query: getUserProfileQuery })
}
