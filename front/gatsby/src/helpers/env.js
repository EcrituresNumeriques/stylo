const backendEndpoint =
  import.meta.env.SNOWPACK_PUBLIC_BACKEND_ENDPOINT || 'http://localhost:3030'
const graphqlEndpoint =
  import.meta.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT ||
  'http://localhost:3030/graphql'
const exportEndpoint =
  import.meta.env.SNOWPACK_PUBLIC_EXPORT_ENDPOINT || 'http://localhost:3060'
const processEndpoint =
  import.meta.env.SNOWPACK_PUBLIC_PROCESS_ENDPOINT || 'http://localhost:9090'
const humanIdRegisterEndpoint =
  import.meta.env.SNOWPACK_PUBLIC_HUMAN_ID_REGISTER_ENDPOINT ||
  'https://auth-test.huma-num.fr/register?service=http://localhost:3030/authorization-code/callback'

const env = {
  BACKEND_ENDPOINT: backendEndpoint,
  GRAPHQL_ENDPOINT: graphqlEndpoint,
  EXPORT_ENDPOINT: exportEndpoint,
  PROCESS_ENDPOINT: processEndpoint,
  HUMAN_ID_REGISTER_ENDPOINT: humanIdRegisterEndpoint,
}

export default env
