const backendEndpoint =
  import.meta.env.SNOWPACK_PUBLIC_BACKEND_ENDPOINT || 'http://localhost:3030'
const graphqlEndpoint =
  import.meta.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT ||
  'http://localhost:3030/graphql'

const env = {
  BACKEND_ENDPOINT: backendEndpoint,
  GRAPHQL_ENDPOINT: graphqlEndpoint,
  EXPORT_ENDPOINT: 'http://localhost:3060',
  PROCESS_ENDPOINT: 'http://localhost:9090',
  HUMAN_ID_REGISTER_ENDPOINT:
    'https://auth-test.huma-num.fr/register?service=http://localhost:3030/authorization-code/callback',
}

export default env
