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
 * @param {string?} opts.delimiters
 * @param {string=} opts.separator
 * @param {number?} opts.keybindings
 * @param {string?} opts.className
 * @param {{[key: string]: string}?} opts.attrs
 * @param {string?} opts.body_pre
 * @param {string?} opts.body_post
 * @returns {IActionDescriptor}
 */
export default function createDelimitedBlockCommand(
  id,
  {
    label = undefined,
    contextMenuGroupId = '1_modification',
    delimiters = ':::',
    separator = '\n\n',
    keybindings = undefined,
    className = undefined,
    attrs = {},
    body_pre = '',
    body_post = '',
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

    const text = `${delimiters}${attributes}\n${bodyParts.join(separator)}\n${delimiters}\n\n`
    const LINE_RETURN_COUNT = text.matchAll('\n').length

    const isTextSelected =
      startLineNumber !== endLineNumber || startColumn !== endColumn
    const newStartLineNumber = isTextSelected
      ? endLineNumber + LINE_RETURN_COUNT
      : startLineNumber + 1
    const newColumn = 0

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
    label: label ?? `actions.infratextual-block.${id}`,
    contextMenuGroupId,
    contextMenuOrder: 1,
    keybindingContext: null,
    enabled: true,
    keybindings,
    run,
  }
}
