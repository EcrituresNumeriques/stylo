import createDelimitedBlockCommand, {
  KeyCode,
  KeyMod,
} from './delimited-block.js'

export default createDelimitedBlockCommand({
  id: 'stylo--infratextual-markup--ack',
  label: 'actions.infratextual-markup.ack',
  contextMenuGroupId: '1_infratextual_markup',
  keybindings: KeyMod.CtrlCmd | KeyCode.KeyA,
  className: 'ack',
})
