import { getFullUserProfile as getUserProfileQuery } from '../hooks/Credentials.graphql'
import { executeQuery } from './graphQL.js'

/**
 * @returns {Promise<object>}
 */
export function getUserProfile() {
  return executeQuery({ query: getUserProfileQuery })
}
