import { Range, Selection } from 'monaco-editor/esm/vs/editor/editor.api'

import { blockAttributes } from './index.js'

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 */

/**
 * @typedef {object} defaultBodyFn
 * @property {string} attributes
 * @property {string[]} bodyParts
 */

/**
 * @typedef {object} customBodyFn
 * @property {string} attributes
 * @property {string} body_template
 * @property {string} clipboardText
 * @property {string} selectionText
 */

/**
 * @typedef {defaultBodyFn | customBodyFn} bodyFnArgs
 */

/**
 *
 * @param {defaultBodyFn} params
 * @returns {[number, string]}
 */
function defaultBodyFn ({ attributes, body_post, body_pre, selectionText }) {
  const bodyParts = [body_pre, selectionText, body_post].map(s => String(s).trim())
  const text = `${bodyParts.join('').trim()}${attributes}`
  const lastLine = selectionText.split('\n').at(-1)

  return [body_pre.length + lastLine.length , text]
}

/**
 * @param {string} id
 * @param {object} opts
 * @param {string} [opts.label]
 * @param {string} [opts.contextMenuGroupId]
 * @param {number} [opts.keybindings]
 * @param {string} [opts.className]
 * @param {{[key: string]: string}} [opts.attrs]
 * @param {string} [opts.body_pre]
 * @param {string} [opts.body_post]
 * @param {string} [opts.body_template]
 * @param {(bodyFnArgs) => [number, string]} [opts.body_fn]
 * @returns {IActionDescriptor}
 */
export default function createInlineBlockCommand(
  id,
  {
    label = undefined,
    contextMenuGroupId = '1_modification',
    keybindings = [],
    className = undefined,
    attrs = {},
    body_pre = '[',
    body_post = ']',
    body_template = null,
    body_fn = defaultBodyFn
  } = {}
) {
  /**
   * @param {ICodeEditor} editor
   */
  async function run(editor) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } =
      editor.getSelection()

    const range = new Range(
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn
    )

    const clipboardText = await navigator.clipboard.readText()
    const selectionText = editor.getModel().getValueInRange(range) || clipboardText || ''
    const attributes = blockAttributes({ classNames: [className ?? id], attrs })

    const newStartLineNumber = endLineNumber
    const [newColumn, text] = /** @type {(bodyFnArgs) => [number, string]} */ body_fn({
      attributes,
      body_post,
      body_pre,
      body_template,
      clipboardText,
      selectionText
    })


    editor.executeEdits(
      id,
      [
        {
          range,
          text,
          forceMoveMarkers: true,
        },
      ],
      [
        new Selection(
          newStartLineNumber,
          newColumn,
          newStartLineNumber,
          newColumn
        ),
      ]
    )
  }

  return {
    id: `stylo--infratextual-markup--${id}`,
    label: label ?? `actions.infratextual-inline.${id}`,
    contextMenuGroupId,
    keybindingContext: null,
    contextMenuOrder: 1,
    enabled: true,
    keybindings,
    run,
  }
}
