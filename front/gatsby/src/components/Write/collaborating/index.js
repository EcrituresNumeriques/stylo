import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as awarenessProtocol from 'y-protocols/awareness.js'

const noop = () => {}

export function connect({ roomName, websocketEndpoint, user, onChange = noop, onConnection = noop }) {
  const doc = new Y.Doc()
  const awareness = new awarenessProtocol.Awareness(doc);
  const wsProvider = new WebsocketProvider(websocketEndpoint, roomName, doc, {
    // Set this to `false` if you want to connect manually using wsProvider.connect()
    connect: true,
    // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
    awareness: awareness
  })

  awareness.on('change', (change, transactionOrigin) => {
    onChange({
      states: awareness.getStates(),
      // args
    })
  })

  awareness.setLocalState({ user })

  // this is used to know if we are the sole persons on the document on connection
  // if people are already online, `sync` will happen after having fetched remote changes
  wsProvider.once('sync', () => onConnection({
    states: awareness.getStates(),
  }))

  return {
    doc,
    wsProvider,
    awareness
  }
}
