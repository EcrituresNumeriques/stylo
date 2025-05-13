import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as awarenessProtocol from 'y-protocols/awareness'
import { readAuthMessage } from 'y-protocols/auth'

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
  onAuthenticationError = noop,
}) {
  const doc = new Y.Doc()
  const awareness = new awarenessProtocol.Awareness(doc)
  const wsProvider = new WebsocketProvider(websocketEndpoint, roomName, doc, {
    // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
    awareness: awareness,
  })
  wsProvider.messageHandlers[99] = (
    _encoder,
    decoder,
    provider,
    _emitSynced,
    _messageType
  ) => {
    readAuthMessage(decoder, provider.doc, (_ydoc, reason) => {
      onAuthenticationError(reason)
    })
  }
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
