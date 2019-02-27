console.log(process.env.GATSBY_GRAPHQL_ENDPOINT)
const env = {
  GRAPHQL_ENDPOINT: process.env.GATSBY_GRAPHQL_ENDPOINT || "https://graphql.stylo.14159.ninja/graphql"
}

export default env;