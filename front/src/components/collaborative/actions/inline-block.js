import {
  Range,
  Selection,
} from 'monaco-editor/esm/vs/editor/editor.api'

import { blockAttributes } from './index.js'

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 */

/**
 * @param {string} id
 * @param {object} opts
 * @param {string?} opts.label
 * @param {string?} opts.contextMenuGroupId
 * @param {number?} opts.keybindings
 * @param {string?} opts.className
 * @param {{[key: string]: string}?} opts.attrs
 * @param {string?} opts.body_pre
 * @param {string?} opts.body_post
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
  } = {}
) {
  /**
   * @param {ICodeEditor} editor
   */
  function run(editor) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } =
      editor.getSelection()

    const range = new Range(
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn
    )

    const originalText = editor.getModel().getValueInRange(range) || ''
    const attributes = blockAttributes({ classNames: [className ?? id], attrs })
    const bodyParts = [body_pre, originalText, body_post].filter((d) => d)

    const text = `${bodyParts.join('').trim()}${attributes}`

    const isTextSelected =
      startLineNumber !== endLineNumber || startColumn !== endColumn

    const newStartLineNumber = endLineNumber
    const newColumn = isTextSelected
      ? endColumn + body_pre.length
      : startColumn + body_pre.length;

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
