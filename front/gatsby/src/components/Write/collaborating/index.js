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

  awareness.on('change', (args) => {
    onChange({
      states: awareness.getStates(),
      // args
    })
  })

  awareness.setLocalState({ user })

  wsProvider.once('status', event => {
    if (event.status === 'connected') {
      onConnection({
        states: awareness.getStates(),
      })
    }
  })

  return {
    wsProvider,
    awareness
  }
}
