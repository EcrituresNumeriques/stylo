import { Selection } from 'monaco-editor/esm/vs/editor/editor.api'

import { blockAttributes } from './index.js'

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('i18next').TFunction} TFunction
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 * @typedef {import('./inline-block.js').EditResult} EditResult
 */
const newLineRE = /\n/g

function countLines (text) {
  return (text.match(newLineRE) || []).length
}

function joinContents (joinSeparator, ...texts) {
  return texts.filter(d => d).join(joinSeparator)
}

function defaultSelectionState (editor) {
  return editor.getSelection()
}

function defaultEndCursorState ({ contentBefore, contentAfter, joinSeparator, preambleText, selection, selectionText, text }) {
  const lineReturnCount = countLines(text)

  const isSelection = selectionText.length > 0

  let newStartLineNumber = 0
  let newStartColumnNumber = selection.getEndPosition().column

  // in case of selection, we position the cursor at the end of it
  if (isSelection) {
    newStartLineNumber = selection.startLineNumber + (selection.endLineNumber - selection.startLineNumber) + countLines(joinSeparator) + countLines(joinContents(joinSeparator, preambleText, contentBefore)) + countLines(joinSeparator)
  }
  // otherwise, we move "in the middle" of the block
  else {
    newStartLineNumber = selection.startLineNumber + countLines(joinContents(joinSeparator, preambleText, contentBefore)) + countLines(joinSeparator)
    newStartColumnNumber += contentBefore.length
  }

  return new Selection(newStartLineNumber, newStartColumnNumber, newStartLineNumber, newStartColumnNumber)
}

/**
 * Builds the text and cursor state for a pandoc fenced div wrapping the
 * current selection.
 *
 * The generated block looks like:
 * ```
 * preamble
 *
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
 * @param {{ selection: Selection, selectionText: string, className: string, attrs: {[key: string]: string}, preamble: string, contentBefore: string, contentAfter: string }} params
 * @param {{ t: TFunction }?} helpers
 * @returns {EditResult}
 */
export function createDelimitedBlockEdit({
  selection,
  selectionText,
  className,
  attrs,
  preamble = null,
  contentBefore = '',
  contentAfter = '',
  endCursorState = defaultEndCursorState
}, { t } = {}) {
  const joinSeparator = '\n'
  const attributes = blockAttributes({ classNames: [className], attrs })
  const bodyParts = [contentBefore, selectionText, contentAfter].filter(
    (d) => d
  )

  let preambleText = ''
  if (typeof preamble === 'function' && typeof t === 'function') {
    preambleText = `${preamble(t)}\n\n`
  }

  const text = `${preambleText}:::${attributes}\n${joinContents(joinSeparator, ...bodyParts)}\n:::\n`

  return {
    endCursorState: endCursorState({
      joinSeparator,
      selection,
      selectionText,
      text,
      preambleText,
      contentBefore,
      contentAfter
    }),
    selection,
    text
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
 * @param {null|function(t) => string} [opts.preamble] - Static content inserted before the opening delimiter
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
    preamble = null,
    contentBefore = '',
    contentAfter = '',
    endCursorState = defaultEndCursorState,
    selectionState = defaultSelectionState,
    forceMoveMarkers = true
  } = {}
) {
  /**
   * @param {ICodeEditor} editor
   * @param {TFunction} t
   */
  function run(editor, t) {
    const selection = editor.getSelection()
    const selectionText = editor.getModel().getValueInRange(selection) || ''

    const edit = createDelimitedBlockEdit({
      selection,
      selectionText,
      className: className ?? id,
      attrs,
      preamble,
      contentBefore,
      contentAfter,
      endCursorState
    }, { t })

    editor.executeEdits(
      id,
      [
        {
          range: selectionState(editor),
          text: edit.text,
          forceMoveMarkers
        }
      ],
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
