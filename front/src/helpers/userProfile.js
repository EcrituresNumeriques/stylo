import { useDispatch, useSelector } from "react-redux"
import askGraphQL from "../helpers/graphQL"

export function getUserProfile(applicationConfig) {
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

  return askGraphQL({ query }, 'userProfile', null, applicationConfig)
}

export function useProfile () {
  const dispatch = useDispatch()
  const graphqlEndpoint = useSelector(state => state.applicationConfig.graphqlEndpoint)

  return function refreshProfile () {
    return getUserProfile({ graphqlEndpoint })
      .then((response) => dispatch({ type: 'PROFILE', ...response }))
  }
}
