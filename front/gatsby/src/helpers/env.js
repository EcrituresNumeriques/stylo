const backendEndpoint = process.env.STYLO_BACKEND_ENDPOINT
const graphqlEndpoint = process.env.GATSBY_GRAPHQL_ENDPOINT
const exportEndpoint = process.env.GATSBY_EXPORT_ENDPOINT
const processEndpoint = process.env.GATSBY_PROCESS_ENDPOINT
const humanIDRegisterEndpoint = process.env.HUMAN_ID_REGISTER_ENDPOINT

const env = {
  BACKEND_ENDPOINT: backendEndpoint || 'http://stylo.huma-num.fr',
  GRAPHQL_ENDPOINT: graphqlEndpoint || 'http://stylo.huma-num.fr/graphql',
  EXPORT_ENDPOINT: exportEndpoint || 'http://stylo.huma-num.fr',
  PROCESS_ENDPOINT: processEndpoint || 'https://stylo-export.ecrituresnumeriques.ca',
  HUMAN_ID_REGISTER_ENDPOINT: humanIDRegisterEndpoint || 'https://humanid.huma-num.fr/register?service=http://stylo.huma-num.fr/authorization-code/callback'
}

export default env;
