const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type User {
  _id: ID!
  displayName: String
}

input UserInput {
  email: String!
  username: String!
  password: String!
}

type RootQuery {
  users:[User!]!
}

type RootMutation {
  createUser(user:UserInput):User!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);
