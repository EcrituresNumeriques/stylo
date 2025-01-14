import { useDispatch, useSelector } from 'react-redux'
import { runQuery } from './graphQL.js'
import { getFullUserProfile as query } from '../components/Credentials.graphql'

export function getUserProfile({ sessionToken }) {
  return runQuery({ sessionToken }, { query })
}

export function useProfile() {
  const dispatch = useDispatch()
  const sessionToken = useSelector((state) => state.sessionToken)

  return function refreshProfile() {
    return getUserProfile({ sessionToken }).then((response) =>
      dispatch({ type: 'PROFILE', ...response })
    )
  }
}
