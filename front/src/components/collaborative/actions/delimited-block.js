import { KeyCode, KeyMod, Range, Selection } from 'monaco-editor'

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 */

/**
 * @param opts
 * @param {string} opts.id
 * @param {string} opts.label
 * @param {string} opts.contextMenuGroupId
 * @param {number} opts.keybindings
 * @param {string} opts.className
 * @returns {IActionDescriptor}
 */
export default function createDelimitedBlockCommand({
  id,
  label,
  contextMenuGroupId,
  keybindings,
  className,
}) {
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
    const originalText = editor.getModel().getValueInRange(range)

    const text = `::: {.${className}}\n${originalText}\n:::\n\n`
    const LINE_RETURN_COUNT = 4 /* 4 x \n in `text` */

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
    id,
    label,
    contextMenuGroupId,
    keybindings: [
      KeyMod.chord(
        // common to 'infratextual markup'
        KeyMod.CtrlCmd | KeyCode.KeyI,
        // specific to this item within the 'infratextual-markup' group
        keybindings
      ),
    ],
    run,
  }
}

export { KeyMod, KeyCode }
