import React, { useEffect, useState } from 'react'

import { UnControlled as CodeMirror } from 'react-codemirror2'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { CodemirrorBinding } from 'y-codemirror'

export default function CollaborativeEditor(props) {
  const [text, setText] = useState('initial text')
  const [realtime, setRealtime] = useState({})

  useEffect(() => {
    console.log('new Y.Doc()')
    const doc = new Y.Doc()
    /*
    const permanentUserData = new Y.PermanentUserData(doc)
    permanentUserData.setUserMapping(doc, doc.clientID, 'ggrossetie')
    const yText = doc.getText('codemirror')
    yText.delete(0, yText.length)
    yText.insert(0, 'initial text')
    var state = Y.encodeStateAsUpdate(yText.doc)
    Y.applyUpdate(doc, state)
    */
    const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', 'react-codemirror', doc)
    setRealtime({ doc, yText })
    return () => {
      wsProvider.destroy()
    }
  }, [])

  return (
    <section>
      {realtime.doc && <CodeMirror
        value=''
        onBeforeChange={(editor, data, value) => {
          //setText(value)
        }}
        editorDidMount={editor => {
          const { yText } = realtime
          const binding = new CodemirrorBinding(yText, editor)
        }}
      />
      }
    </section>)
}
