import { useDispatch } from "react-redux"
import { useGraphQL } from "../helpers/graphQL"

export function getUserProfile() {
  const runQuery = useGraphQL()
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

  return runQuery({ query })
}

export function useProfile () {
  const dispatch = useDispatch()

  return function refreshProfile () {
    return getUserProfile()
      .then((response) => dispatch({ type: 'PROFILE', ...response }))
  }
}
