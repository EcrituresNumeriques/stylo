import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as awarenessProtocol from 'y-protocols/awareness.js'

const noop = () => {}

export function connect({ roomName, websocketEndpoint, user, onChange = noop, onConnection = noop }) {
  const doc = new Y.Doc()
  const awareness = new awarenessProtocol.Awareness(doc);
  const wsProvider = new WebsocketProvider(websocketEndpoint, roomName, doc, {
    // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
    awareness: awareness
  })

  awareness.on('change', (change, transactionOrigin) => {
    onChange({
      states: awareness.getStates(),
      // args
    })
  })

  wsProvider.once('sync', () => onConnection({
    states: awareness.getStates(),
  }))

  awareness.setLocalState({ user })

  return {
    doc,
    wsProvider,
    awareness
  }
}
