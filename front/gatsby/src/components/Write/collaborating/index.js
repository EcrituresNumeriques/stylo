import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import * as awarenessProtocol from 'y-protocols/awareness.js'

const noop = () => {}

export function connect({ roomName, websocketEndpoint, sessionToken, user, onChange = noop, onConnection = noop }) {
  const doc = new Y.Doc()
  const awareness = new awarenessProtocol.Awareness(doc);
  const params = sessionToken ? { token: sessionToken } : {}
  const wsProvider = new WebsocketProvider(websocketEndpoint, roomName, doc, {
    // Set this to `false` if you want to connect manually using wsProvider.connect()
    connect: true,
    // Specify a query-string that will be url-encoded and attached to the `serverUrl`
    // I.e. params = { auth: "bearer" } will be transformed to "?auth=bearer"
    params,
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
