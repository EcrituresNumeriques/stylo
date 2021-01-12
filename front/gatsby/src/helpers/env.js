const backendEndpoint = process.env.GATSBY_STYLO_BACKEND_ENDPOINT
const graphqlEndpoint = process.env.GATSBY_GRAPHQL_ENDPOINT
const exportEndpoint = process.env.GATSBY_EXPORT_ENDPOINT
const processEndpoint = process.env.GATSBY_PROCESS_ENDPOINT
const humanIDRegisterEndpoint = process.env.GATSBY_HUMAN_ID_REGISTER_ENDPOINT

const env = {
  BACKEND_ENDPOINT: backendEndpoint || 'http://localhost:3030',
  GRAPHQL_ENDPOINT: graphqlEndpoint || 'http://localhost:3030/graphql',
  EXPORT_ENDPOINT: exportEndpoint || 'http://localhost:3060',
  PROCESS_ENDPOINT: processEndpoint || 'http://localhost:9090',
  HUMAN_ID_REGISTER_ENDPOINT:
    humanIDRegisterEndpoint ||
    'https://auth-test.huma-num.fr/register?service=http://localhost:3030/authorization-code/callback',
}

export default env
