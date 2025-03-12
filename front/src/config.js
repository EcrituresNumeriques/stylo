// variables defined statically via vite.config.js
const { host } = window.location

export const applicationConfig = {
  frontendEndpoint: `//${host}`,
  backendEndpoint: __BACKEND_ENDPOINT__,
  canonicalBaseUrl: __ANNOTATIONS_CANONICAL_BASE_URL__,
  graphqlEndpoint: __GRAPHQL_ENDPOINT__,
  pandocExportEndpoint: __PANDOC_EXPORT_ENDPOINT__,
  pandocExportHost: import.meta.env.SNOWPACK_PUBLIC_PANDOC_EXPORT_HOST ?? host,
  websocketEndpoint: toWebsocketEndpoint(__BACKEND_ENDPOINT__),
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
