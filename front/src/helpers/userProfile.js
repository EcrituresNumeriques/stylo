import { runQuery } from './graphQL.js'
import { getFullUserProfile as query } from '../components/Credentials.graphql'

export function getUserProfile({ sessionToken }) {
  return runQuery({ sessionToken }, { query })
}
