import { useDispatch, useSelector } from "react-redux"
import askGraphQL from "../helpers/graphQL"

export function getUserProfile({ applicationConfig, sessionToken }) {
  const query = `query {
    user {
      _id
      displayName
      authType
      firstName
      lastName
      institution
      email
      yaml
      admin
      createdAt
      updatedAt
      apiToken
      zoteroToken

      acquintances {
        _id
        email
        displayName
      }

      permissions {
        scope
        roles
        user {
          _id
          displayName
        }
      }
    }
  }`

  return askGraphQL({ query }, 'userProfile', sessionToken, applicationConfig)
}

export function useProfile () {
  const dispatch = useDispatch()
  const graphqlEndpoint = useSelector(state => state.applicationConfig.graphqlEndpoint)
  const sessionToken = useSelector(state => state.sessionToken)

  const applicationConfig = { graphqlEndpoint }

  return function refreshProfile () {
    return getUserProfile({ applicationConfig, sessionToken })
      .then((response) => dispatch({ type: 'PROFILE', ...response }))
  }
}
