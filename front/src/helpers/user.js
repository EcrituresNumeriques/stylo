import { executeQuery } from './graphQL.js'
import { getFullUserProfile as getUserProfileQuery } from '../components/Credentials.graphql'

export function getUserProfile({ sessionToken }) {
  return executeQuery({ sessionToken, query: getUserProfileQuery })
}
