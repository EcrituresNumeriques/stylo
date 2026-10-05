import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/editor'
import editorWorker from 'monaco-editor/editor/editor.worker?worker'
import 'monaco-editor/features/register.all.js'

import 'monaco-editor/languages/definitions/markdown/register.js'
import 'monaco-editor/languages/definitions/yaml/register.js'

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
