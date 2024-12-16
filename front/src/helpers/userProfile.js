import { useDispatch, useSelector } from 'react-redux'
import { runQuery } from './graphQL.js'
import { getFullUserProfile as query } from '../components/Credentials.graphql'

export function getUserProfile({ applicationConfig, sessionToken }) {
  const { graphqlEndpoint } = applicationConfig
  return runQuery({ graphqlEndpoint, sessionToken }, { query })
}

export function useProfile() {
  const dispatch = useDispatch()
  const graphqlEndpoint = useSelector(
    (state) => state.applicationConfig.graphqlEndpoint
  )
  const sessionToken = useSelector((state) => state.sessionToken)

  const applicationConfig = { graphqlEndpoint }

  return function refreshProfile() {
    return getUserProfile({ applicationConfig, sessionToken }).then(
      (response) => dispatch({ type: 'PROFILE', ...response })
    )
  }
}
