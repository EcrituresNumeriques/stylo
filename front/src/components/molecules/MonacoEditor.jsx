import React from 'react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import Editor, { loader } from '@monaco-editor/react'

// Use monaco-editor as a npm package;
// import it from node_modules and include monaco sources into your bundle (instead of using CDN).
// Reference: https://github.com/suren-atoyan/monaco-react#use-monaco-editor-as-an-npm-package
self.MonacoEnvironment = {
  getWorker() {
    // noinspection JSPotentiallyInvalidConstructorUsage
    return new editorWorker()
  },
}

loader.config({ monaco })
loader.init()

export default function MonacoEditor(props) {
  return <Editor {...props} />
}
