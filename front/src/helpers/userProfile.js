import { useDispatch } from 'react-redux'
import { runQuery, useGraphQLClient } from './graphQL.js'
import { getFullUserProfile as getUserProfileQuery } from '../components/Credentials.graphql'

export function getUserProfile({ sessionToken }) {
  return runQuery({ sessionToken }, { query })
}

export function useProfile() {
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()

  return function refreshProfile() {
    return query({ query: getUserProfileQuery }).then((response) =>
      dispatch({ type: 'PROFILE', ...response })
    )
  }
}
