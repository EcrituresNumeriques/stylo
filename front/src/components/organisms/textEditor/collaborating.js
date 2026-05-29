import * as awarenessProtocol from 'y-protocols/awareness.js'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

const noop = () => {}

export function connect({
  roomName,
  websocketEndpoint,
  user,
  onChange = noop,
  onConnection = noop,
  onStatusUpdated = noop,
  onConnectionError = noop,
  onConnectionClosed = noop,
}) {
  const doc = new Y.Doc()
  const awareness = new awarenessProtocol.Awareness(doc)
  const wsProvider = new WebsocketProvider(websocketEndpoint, roomName, doc, {
    // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
    awareness: awareness,
  })

  awareness.on('change', () => {
    onChange({
      states: awareness.getStates(),
      // args
    })
  })

  wsProvider.once('sync', () =>
    onConnection({
      states: awareness.getStates(),
    })
  )
  wsProvider.on('status', (event) => {
    onStatusUpdated(event.status)
  })
  wsProvider.on('connection-close', (wsClosedEvent) => {
    onConnectionClosed(wsClosedEvent)
  })
  wsProvider.on('connection-error', (wsErrorEvent) => {
    onConnectionError(wsErrorEvent)
  })

  awareness.setLocalState({ user })

  return {
    doc,
    wsProvider,
    awareness,
  }
}
