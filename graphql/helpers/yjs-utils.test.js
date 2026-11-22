const { EventEmitter } = require('node:events')
const { afterEach, before, describe, test } = require('node:test')
const assert = require('node:assert')

// ESM builds only: requiring y-protocols would load the CommonJS build of Yjs
// alongside the ESM one used by yjs-utils.mjs (see yjs/yjs#438)
let yjsUtils, Y, decoding, encoding, syncProtocol

before(async () => {
  yjsUtils = await import('./yjs-utils.mjs')
  Y = yjsUtils.Y
  decoding = await import('lib0/decoding')
  encoding = await import('lib0/encoding')
  syncProtocol = await import('y-protocols/sync')
})

afterEach(() => {
  yjsUtils.setPersistence(null)
  // the awareness of a document keeps an interval running until it is destroyed
  for (const doc of yjsUtils.docs.values()) {
    doc.destroy()
  }
  yjsUtils.docs.clear()
})

const messageSync = 0

/**
 * Minimal WebSocket connection: records the messages sent by the server.
 */
function createConnection() {
  const conn = new EventEmitter()
  conn.readyState = 1
  conn.sent = []
  conn.send = (message, _options, callback) => {
    conn.sent.push(message)
    callback?.()
  }
  conn.ping = () => {}
  conn.close = () => {}
  return conn
}

/**
 * Applies the sync messages sent by the server to a client document.
 * @param {Uint8Array[]} messages
 * @param {import('yjs').Doc} clientDoc
 */
function receive(messages, clientDoc) {
  for (const message of messages) {
    const decoder = decoding.createDecoder(message)
    if (decoding.readVarUint(decoder) === messageSync) {
      syncProtocol.readSyncMessage(
        decoder,
        encoding.createEncoder(),
        clientDoc,
        null
      )
    }
  }
}

function syncStep1(clientDoc) {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeSyncStep1(encoder, clientDoc)
  return encoding.toUint8Array(encoder)
}

describe('setupWSConnection', () => {
  test('synchronizes the clients once the persisted document is loaded', async () => {
    let loaded
    yjsUtils.setPersistence({
      bindState: async (_docName, ydoc) => {
        await new Promise((resolve) => {
          loaded = resolve
        })
        ydoc.getText('main').insert(0, '# Titre\n\nContenu')
      },
      writeState: async () => {},
    })

    const conn = createConnection()
    const clientDoc = new Y.Doc()
    yjsUtils.setupWSConnection(conn, { url: '/ws/article' })
    // the client starts the synchronization right away
    conn.emit('message', syncStep1(clientDoc))
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(conn.sent.length, 0, 'nothing is sent while loading')

    loaded()
    await yjsUtils.docs.get('ws/article').whenInitialized
    receive(conn.sent, clientDoc)
    assert.equal(clientDoc.getText('main').toString(), '# Titre\n\nContenu')

    conn.emit('close')
  })

  test('synchronizes right away without persistence', () => {
    const conn = createConnection()
    yjsUtils.setupWSConnection(conn, { url: '/ws/article' })
    return yjsUtils.docs
      .get('ws/article')
      .whenInitialized.then(() => {
        assert.ok(conn.sent.length > 0)
      })
      .finally(() => conn.emit('close'))
  })
})
