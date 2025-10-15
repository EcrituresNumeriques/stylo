import { KeyMod, Range, Selection } from 'monaco-editor'

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 */

/** @type {IActionDescriptor} */
const command = {
  id: 'stylo--balisage-infra--quote2',
  label: 'actions.balisage-infra.quote2',
  contextMenuGroupId: '1_balisage_infra',
  keybindings: [
    KeyMod.chord(
      // common to 'balisage-infra'
      KeyMod.CtrlCmd | KeyMod.KeyI,
      // specific to this item within the 'balisage-infra' group
      KeyMod.CtrlCmd | KeyMod.KeyA
    )
  ],
  run
}

export default command

/**
 * @param {ICodeEditor} editor
 */
export function run (editor) {
  const { startLineNumber, startColumn, endLineNumber, endColumn } = editor.getSelection()
  const range = new Range(startLineNumber, startColumn, endLineNumber, endColumn)
  const originalText = editor.getModel().getValueInRange(range)

  const text = `::: {.quote2}\n${originalText}\n:::\n\n`
  const LINE_RETURN_COUNT = 4 /* 4 x \n in `text` */

  const isTextSelected = startLineNumber !== endLineNumber || startColumn !== endColumn
  const newStartLineNumber = isTextSelected ? endLineNumber + LINE_RETURN_COUNT : startLineNumber+1
  const newColumn = 0

  editor.executeEdits(command.id, [
    {
      range,
      text,
    }
  ], [
    new Selection(newStartLineNumber, newColumn, newStartLineNumber, newColumn)
  ])
}