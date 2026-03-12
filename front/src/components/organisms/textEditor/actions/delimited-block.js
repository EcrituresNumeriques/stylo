import { Selection } from 'monaco-editor/esm/vs/editor/editor.api'

import { blockAttributes } from './index.js'

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 * @typedef {import('./inline-block.js').EditResult} EditResult
 */

// Edit function (pure — no Monaco editor instance required)

/**
 * Builds the text and cursor state for a pandoc fenced div wrapping the
 * current selection.
 *
 * The generated block looks like:
 * ```
 * :::{.className attr="value"}
 * contentBefore
 *
 * <selected text>
 *
 * contentAfter
 * :::
 * ```
 *
 * The cursor lands on the first line after the closing delimiter when text
 * was selected, or on the first line inside the block otherwise.
 * @param {{ selection: Selection, selectionText: string, className: string, attrs: {[key: string]: string}, contentBefore: string, contentAfter: string }} params
 * @returns {EditResult}
 */
export function createDelimitedBlockEdit({
  selection,
  selectionText,
  className,
  attrs,
  contentBefore,
  contentAfter,
}) {
  const attributes = blockAttributes({ classNames: [className], attrs })
  const bodyParts = [contentBefore, selectionText, contentAfter].filter(
    (d) => d
  )

  const text = `:::${attributes}\n${bodyParts.join('\n\n')}\n:::\n`
  const lineReturnCount = (text.match(/\n/g) ?? []).length

  const newStartLineNumber =
    selectionText !== ''
      ? selection.endLineNumber + lineReturnCount
      : selection.startLineNumber + 1

  return {
    text,
    endCursorState: new Selection(newStartLineNumber, 0, newStartLineNumber, 0),
  }
}

// Command (depends on a Monaco editor instance)

/**
 * Creates a Monaco editor action that wraps the selected text (or cursor
 * position) in a pandoc fenced div (`:::`).
 * @param {string} id - Command id and default CSS class (unless `className` is provided)
 * @param {object} [opts]
 * @param {number[]} [opts.keybindings] - Optional Monaco keybinding(s)
 * @param {string} [opts.className] - CSS class for the fenced div (defaults to `id`)
 * @param {{[key: string]: string}} [opts.attrs] - Additional pandoc attributes
 * @param {string} [opts.contentBefore] - Static content inserted before the selected text
 * @param {string} [opts.contentAfter] - Static content inserted after the selected text
 * @returns {IActionDescriptor}
 */
export default function createDelimitedBlockCommand(
  id,
  {
    keybindings = undefined,
    className = undefined,
    attrs = {},
    contentBefore = '',
    contentAfter = '',
  } = {}
) {
  /** @param {ICodeEditor} editor */
  function run(editor) {
    const selection = editor.getSelection()
    const selectionText = editor.getModel().getValueInRange(selection) || ''
    const edit = createDelimitedBlockEdit({
      selection,
      selectionText,
      className: className ?? id,
      attrs,
      contentBefore,
      contentAfter,
    })
    editor.executeEdits(
      id,
      [{ range: selection, text: edit.text, forceMoveMarkers: true }],
      [edit.endCursorState]
    )
  }

  return {
    id: `stylo--infratextual-markup--${id}`,
    label: `actions.infratextual-block.${id}`,
    contextMenuGroupId: '1_modification',
    contextMenuOrder: 1,
    keybindingContext: null,
    enabled: true,
    keybindings,
    run,
  }
}
