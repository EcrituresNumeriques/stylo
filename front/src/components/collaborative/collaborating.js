import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as awarenessProtocol from 'y-protocols/awareness.js'

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

  awareness.on('change', (change, transactionOrigin) => {
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
  wsProvider.on('status', function (event) {
    onStatusUpdated(event.status)
  })
  wsProvider.on('connection-close', function (wsClosedEvent) {
    onConnectionClosed(wsClosedEvent)
  })
  wsProvider.on('connection-error', function (wsErrorEvent) {
    onConnectionError(wsErrorEvent)
  })

  awareness.setLocalState({ user })

  return {
    doc,
    wsProvider,
    awareness,
  }
}
