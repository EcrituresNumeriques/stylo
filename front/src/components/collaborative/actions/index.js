import createDelimitedBlockCommand from './delimited-block.js'
import createInlineBlockCommand from './inline-block.js'
import {
  SubmenuAction,
  toAction,
} from 'monaco-editor/esm/vs/base/common/actions.js'
import { KeyCode, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api.js'

export const actions = {
  acknowledgement: createDelimitedBlockCommand('ack', {
    keybindings: KeyMod.CtrlCmd | KeyCode.KeyA,
  }),
  dedication: createDelimitedBlockCommand('dedi'),
  endnote: createDelimitedBlockCommand('endnote'),
  epigraph: createDelimitedBlockCommand('epigraph', {
    body_pre: '[@source]',
  }),
  figure: createDelimitedBlockCommand('figure', {
    body_pre: '\n[titre]{.head}\n\n![caption](image.png)',
    body_post: ':::{.credits}\n[]{.credits} [@source]\n:::',
  }),
  inlinequote: createInlineBlockCommand('inlinequote'),
  notepreAuthor: createDelimitedBlockCommand('notepre.aut', {
    attrs: { origin: 'aut' },
    className: 'notepre',
  }),
  noteprePublisher: createDelimitedBlockCommand('notepre.pb', {
    attrs: { origin: 'pb' },
    className: 'notepre',
  }),
  notepreTranslator: createDelimitedBlockCommand('notepre.tr', {
    attrs: { origin: 'tr' },
    className: 'notepre',
  }),
  question: createDelimitedBlockCommand('question', {
    body_pre: '[nom de personne]{.speaker}',
  }),
  quoteAlt: createDelimitedBlockCommand('quote-alt'),
  reponse: createDelimitedBlockCommand('answ', {
    body_pre: '[nom de personne]{.speaker}',
  }),
  signature: createDelimitedBlockCommand('sig'),
  smallcaps: createInlineBlockCommand('smallcaps'),
  sponsor: createDelimitedBlockCommand('sponsor'),
}

/**
 * @typedef {import('monaco-editor').editor.IActionDescriptor} IActionDescriptor
 * @typedef {import('monaco-editor').editor.ICodeEditor} ICodeEditor
 * @typedef {import('i18next').TFunction} TFunction
 */

/**
 * This ensures context menu action and command palette action
 * both receive an editor instance as first parameter
 * It enforces a translated label as well.
 *
 * @param {ICodeEditor} editor
 * @param {TFunction} t
 * @param {IActionDescriptor} action
 * @returns {IActionDescriptor} bound action
 */
export function bindAction(editor, t, action) {
  return toAction({
    ...action,
    label: t(action.label),
    run: action.run.bind(null, editor),
  })
}

/**
 *
 * @param {object} attributes
 * @param {Array.<string>} attributes.classNames
 * @param {{[key: string]: string}} attributes.attrs
 * @returns {string}
 */
export function blockAttributes({ classNames = [], attrs = {} } = {}) {
  return [
    classNames.map((c) => `.${c}`),
    Object.entries(attrs).map(([key, value]) => `${key}="${value}"`),
  ]
    .flatMap((d) => d)
    .filter((d) => d)
    .join(' ')
}

/**
 *
 * @see https://github.com/microsoft/monaco-editor/issues/1947#issuecomment-3245201455
 * @param {object} options
 * @param {ICodeEditor} options.editor
 * @param {TFunction} options.t
 * @returns {SubmenuAction}
 */
export function MetopesMenu({ editor, t }) {
  const _bindAction = bindAction.bind(null, editor, t)

  return new SubmenuAction(
    'stylo--metopes--root',
    t('stylo.metopes.rootMenu'),
    [
      new SubmenuAction(
        'stylo--metopes--liminaires',
        t('stylo.metopes.liminaires'),
        [
          _bindAction(actions.acknowledgement),
          _bindAction(actions.epigraph),
          _bindAction(actions.notepreAuthor),
          _bindAction(actions.noteprePublisher),
          _bindAction(actions.notepreTranslator),
          _bindAction(actions.endnote),
          _bindAction(actions.dedication),
          _bindAction(actions.sponsor),
        ]
      ),
      new SubmenuAction(
        'stylo--metopes--citations',
        t('stylo.metopes.citations'),
        [_bindAction(actions.inlinequote), _bindAction(actions.quoteAlt)]
      ),
      new SubmenuAction('stylo--metopes--texte', t('stylo.metopes.texte'), [
        new SubmenuAction(
          'stylo--metopes--entretien',
          t('stylo.metopes.entretien'),
          [_bindAction(actions.question), _bindAction(actions.reponse)]
        ),
        _bindAction(actions.signature),
        _bindAction(actions.smallcaps),
      ]),
      _bindAction(actions.figure),
    ]
  )
}
