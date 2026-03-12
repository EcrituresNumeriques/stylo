import {
  KeyCode,
  KeyMod,
  Selection,
} from 'monaco-editor/esm/vs/editor/editor.api'

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 */

/**
 * @typedef {object} EditResult
 * @property {string} text - The text to insert
 * @property {Selection} endCursorState - The cursor position after the edit
 */

// Helpers

/**
 * Returns true if `text` is a valid URL.
 * @param {string} [text]
 * @returns {boolean}
 */
function isURL(text) {
  try {
    new URL(text)
    return true
  } catch {
    return false
  }
}

/**
 * Builds a Monaco command descriptor with the common Stylo infratextual fields.
 * @param {string} id
 * @param {{ keybindings?: number[], run: (editor: ICodeEditor) => Promise<void> }} options
 * @returns {IActionDescriptor}
 */
function buildCommandDescriptor(id, { keybindings = undefined, run }) {
  return {
    id: `stylo--infratextual-markup--${id}`,
    label: `actions.infratextual-inline.${id}`,
    contextMenuGroupId: '1_modification',
    keybindingContext: null,
    contextMenuOrder: 1,
    enabled: true,
    keybindings,
    run,
  }
}

//  Edit functions (pure — no Monaco editor instance required)

/**
 * Wraps or unwraps the selection with a formatting mark (e.g. `**` for bold,
 * `_` for italic). When the selection already starts and ends with the mark,
 * the mark is removed (toggle off).
 * @param {{ selection: Selection, selectionText: string, formattingMark: string }} params
 * @returns {EditResult}
 */
export function createEnclosingTextFormattingEdit({
  selection,
  selectionText,
  formattingMark,
}) {
  const hasSelectionText = Boolean(selectionText)

  if (hasSelectionText) {
    if (
      selectionText.startsWith(formattingMark) &&
      selectionText.endsWith(formattingMark)
    ) {
      // Toggle off: strip the marks and collapse the cursor to the start
      const text = selectionText.slice(
        formattingMark.length,
        -formattingMark.length
      )
      return {
        text,
        endCursorState: new Selection(
          selection.startLineNumber,
          selection.startColumn,
          selection.startLineNumber,
          selection.startColumn
        ),
      }
    }

    const text = [formattingMark, selectionText, formattingMark]
      .map((s) => String(s).trim())
      .join('')
    // Place the cursor after the closing mark
    const positionColumn = selectionText.includes('\n')
      ? selectionText.split('\n').at(-1).length + formattingMark.length
      : text.length + selection.startColumn
    const endLineNumber = selection.endLineNumber
    return {
      text,
      endCursorState: new Selection(
        endLineNumber,
        positionColumn,
        endLineNumber,
        positionColumn
      ),
    }
  }

  // No selection: insert empty marks and place cursor between them
  const text = `${formattingMark}${formattingMark}`
  const positionColumn = selection.startColumn + formattingMark.length
  const endLineNumber = selection.endLineNumber
  return {
    text,
    endCursorState: new Selection(
      endLineNumber,
      positionColumn,
      endLineNumber,
      positionColumn
    ),
  }
}

/**
 * Wraps the selection with a Pandoc span carrying a CSS class attribute,
 * e.g. `[text]{.smallcaps}`.
 * @param {{ selection: Selection, selectionText: string, styleName: string }} params
 * @returns {EditResult}
 */
export function createEnclosingTextStyleEdit({
  selection,
  selectionText,
  styleName,
}) {
  const hasSelectionText = Boolean(selectionText)
  const styleAttr = `{.${styleName}}`
  // When there is selected text the cursor lands after the closing `}`,
  // otherwise it lands inside the brackets ready to type.
  const positionColumn = hasSelectionText
    ? selection.endColumn + styleAttr.length + 2
    : selection.startColumn + 1
  const endLineNumber = selection.endLineNumber
  return {
    text: `[${selectionText}]${styleAttr}`,
    endCursorState: new Selection(
      endLineNumber,
      positionColumn,
      endLineNumber,
      positionColumn
    ),
  }
}

/**
 * Appends an inline footnote marker `^[]` after the selection and places the
 * cursor inside the brackets.
 * @param {{ selection: Selection, selectionText: string }} params
 * @returns {EditResult}
 */
export function createInlineFootnoteEdit({ selection, selectionText }) {
  const positionColumn = selection.endColumn + 2
  const endLineNumber = selection.endLineNumber
  return {
    text: `${selectionText}^[]`,
    endCursorState: new Selection(
      endLineNumber,
      positionColumn,
      endLineNumber,
      positionColumn
    ),
  }
}

/**
 * Builds a Markdown hyperlink `[text](url)` by combining the current
 * selection and clipboard content:
 * - If the selection is a URL it becomes the href; otherwise it becomes the
 *   link label.
 * - The clipboard is used as a fallback for the non-URL part.
 * @param {{ selection: Selection, selectionText: string, clipboardText: string }} params
 * @returns {EditResult}
 */
export function createHyperlinkEdit({
  selection,
  clipboardText,
  selectionText,
}) {
  const hasClipboardText = Boolean(clipboardText)
  const hasSelectionText = Boolean(selectionText)
  const isClipboardTextUrl = hasClipboardText ? isURL(clipboardText) : false
  const isSelectionTextUrl = hasSelectionText ? isURL(selectionText) : false

  let urlPart = 'https://example.com'
  let textPart = ''
  if (hasClipboardText) {
    if (isClipboardTextUrl) {
      urlPart = clipboardText
    } else {
      textPart = clipboardText
    }
  }
  if (hasSelectionText) {
    if (isSelectionTextUrl) {
      urlPart = selectionText
    } else {
      textPart = selectionText
    }
  }

  const text = `[${textPart}](${urlPart})`
  const positionColumn = textPart.includes('\n')
    ? textPart.split('\n').at(-1).length + 1
    : selection.startColumn + textPart.length + 1
  return {
    text,
    endCursorState: new Selection(
      selection.endLineNumber,
      positionColumn,
      selection.endLineNumber,
      positionColumn
    ),
  }
}

// Commands (exported — depend on a Monaco editor instance)

/**
 * Creates a command that wraps/unwraps the selection with a formatting mark.
 * @param {string} id
 * @param {{ formattingMark: string, keybindings: number[] }} options
 * @returns {IActionDescriptor}
 */
export function createEnclosingTextFormattingCommand(
  id,
  { formattingMark, keybindings }
) {
  /** @param {ICodeEditor} editor */
  async function run(editor) {
    const selection = editor.getSelection()
    const selectionText = editor.getModel().getValueInRange(selection)
    const edit = createEnclosingTextFormattingEdit({
      selection,
      selectionText,
      formattingMark,
    })
    editor.executeEdits(
      id,
      [{ range: selection, text: edit.text, forceMoveMarkers: true }],
      [edit.endCursorState]
    )
  }

  return buildCommandDescriptor(id, { keybindings, run })
}

/**
 * Creates a command that wraps the selection in a Pandoc CSS-class span.
 * @param {string} id
 * @param {{ styleName?: string }} [options]
 * @returns {IActionDescriptor}
 */
export function createEnclosingTextStyleCommand(
  id,
  { styleName } = { styleName: id }
) {
  /** @param {ICodeEditor} editor */
  async function run(editor) {
    const selection = editor.getSelection()
    const selectionText = editor.getModel().getValueInRange(selection)
    const edit = createEnclosingTextStyleEdit({
      selection,
      selectionText,
      styleName: styleName ?? id,
    })
    editor.executeEdits(
      id,
      [{ range: selection, text: edit.text, forceMoveMarkers: true }],
      [edit.endCursorState]
    )
  }

  return buildCommandDescriptor(id, { run })
}

/**
 * Creates a command that appends an inline footnote `^[]` after the selection.
 * Default keybinding: Ctrl/Cmd + Alt + F.
 * @param {string} id
 * @returns {IActionDescriptor}
 */
export function createInlineFootnoteCommand(id) {
  /** @param {ICodeEditor} editor */
  async function run(editor) {
    const selection = editor.getSelection()
    const selectionText = editor.getModel().getValueInRange(selection)
    const edit = createInlineFootnoteEdit({ selection, selectionText })
    editor.executeEdits(
      id,
      [{ range: selection, text: edit.text, forceMoveMarkers: true }],
      [edit.endCursorState]
    )
  }

  return buildCommandDescriptor(id, {
    keybindings: [[KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyF]],
    run,
  })
}

/**
 * Creates a command that inserts a Markdown hyperlink, using the clipboard
 * and/or current selection to populate the URL and label.
 * Default keybinding: Ctrl/Cmd + K.
 * @param {string} id
 * @returns {IActionDescriptor}
 */
export function createHyperlinkCommand(id) {
  /** @param {ICodeEditor} editor */
  async function run(editor) {
    const selection = editor.getSelection()
    const selectionText = editor.getModel().getValueInRange(selection)
    const clipboardText = await navigator.clipboard.readText()
    const hasClipboardText = Boolean(clipboardText)
    if (hasClipboardText) {
      await navigator.clipboard.writeText('') // clear clipboard once used
    }
    const edit = createHyperlinkEdit({
      selection,
      selectionText,
      clipboardText,
    })
    editor.executeEdits(
      id,
      [{ range: selection, text: edit.text, forceMoveMarkers: true }],
      [edit.endCursorState]
    )
  }

  return buildCommandDescriptor(id, {
    keybindings: [KeyMod.CtrlCmd | KeyCode.KeyK],
    run,
  })
}
