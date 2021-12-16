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

      acquintances {
        _id
        email
        displayName
      }

      permissions {
        scope
        roles
        user
      }
    }
  }`

  return askGraphQL({ query }, 'Fetch user profile', '', applicationConfig)
}
