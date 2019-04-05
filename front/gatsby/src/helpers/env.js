console.log(process.env.GATSBY_GRAPHQL_ENDPOINT)
const env = {
  GRAPHQL_ENDPOINT: process.env.GATSBY_GRAPHQL_ENDPOINT || "https://graphql.stylo.ecrituresnumeriques.ca/graphql",
  EXPORT_ENDPOINT: process.env.GATSBY_EXPORT_ENDPOINT || "https://stylo.ecrituresnumeriques.ca",
  PROCESS_ENDPOINT: process.env.GATSBY_PROCESS_ENDPOINT || "https://stylo-export.ecrituresnumeriques.ca"
}

export default env;