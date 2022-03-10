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

  return askGraphQL({ query }, 'Fetch user profile', '', applicationConfig)
}
