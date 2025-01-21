// variables defined statically via vite.config.js
export const applicationConfig = {
  backendEndpoint: __BACKEND_ENDPOINT__,
  graphqlEndpoint: __GRAPHQL_ENDPOINT__,
  exportEndpoint: __EXPORT_ENDPOINT__,
  processEndpoint: __PROCESS_ENDPOINT__,
  pandocExportEndpoint: __PANDOC_EXPORT_ENDPOINT__,
  humanIdRegisterEndpoint: __HUMANID_REGISTER_ENDPOINT__,
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
