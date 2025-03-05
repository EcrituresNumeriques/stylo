// variables defined statically via vite.config.js
const { host } = window.location

export const applicationConfig = {
  frontendEndpoint: `//${host}`,
  backendEndpoint: import.meta.env.SNOWPACK_PUBLIC_BACKEND_ENDPOINT,
  canonicalBaseUrl: import.meta.env
    .SNOWPACK_PUBLIC_ANNOTATIONS_CANONICAL_BASE_URL,
  graphqlEndpoint: import.meta.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT,
  pandocExportEndpoint: import.meta.env.SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT,
  pandocExportHost:
    import.meta.env.SNOWPACK_PUBLIC_PANDOC_EXPORT_HOST ?? window.location.host,
  humanIdRegisterEndpoint: import.meta.env
    .SNOWPACK_PUBLIC_HUMAN_ID_REGISTER_ENDPOINT,
  websocketEndpoint: toWebsocketEndpoint(
    import.meta.env.SNOWPACK_PUBLIC_HUMAN_ID_REGISTER_ENDPOINT
  ),
}

function toWebsocketEndpoint(endpoint) {
  if (endpoint) {
    const endpointUrl = new URL(endpoint)
    const protocol = endpointUrl.protocol
    return `${protocol === 'https:' ? 'wss' : 'ws'}://${endpointUrl.hostname}:${
      endpointUrl.port
    }/ws`
  }
  return `ws://127.0.0.1:3030/ws`
}
