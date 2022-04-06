import 'codemirror/mode/markdown/markdown'
import 'codemirror/lib/codemirror.css'
import { Controlled as CodeMirror } from 'react-codemirror2-react-17'
import { useSelector } from 'react-redux'
import { useRef, useEffect } from 'react'


export default function TextEditor ({ text, className, readOnly, onTextUpdate }) {
  const editorCursorPosition = useSelector(state => state.editorCursorPosition)
  const editorRef = useRef(null)

  useEffect(() => {
    const current = editorRef.current
    if (current && current.editor) {
      const editor = current.editor
      editor.focus()
      editor.setCursor(editorCursorPosition.lineNumber, editorCursorPosition.column)
      editor.execCommand('goLineEnd')
    }
  }, [editorRef, editorCursorPosition])

  const codeMirrorOptions = {
    mode: 'markdown',
    lineWrapping: true,
    lineNumbers: false,
    autofocus: true,
    viewportMargin: Infinity,
    spellcheck: true,
    extraKeys: {
      'Shift-Ctrl-Space': function (cm) {
        cm.replaceSelection('\u00a0')
      },
    },
  }
  return (
    <div className={className}>
      {readOnly && <pre>{text}</pre>}
      {!readOnly && <CodeMirror
        value={text}
        cursor={{ line: 0, character: 0 }}
        editorDidMount={() => {
          window.scrollTo(0, 0)
          //editor.scrollIntoView({ line: 0, ch: 0 })
        }}
        onBeforeChange={onTextUpdate}
        options={codeMirrorOptions}
        ref={editorRef}
      />}
    </div>
  )
}
