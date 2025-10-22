import createDelimitedBlockCommand from './delimited-block.js'
import createInlineBlockCommand from './inline-block.js'
import {
  Separator,
  SubmenuAction,
  toAction,
} from 'monaco-editor/esm/vs/base/common/actions'
export { Separator } from 'monaco-editor/esm/vs/base/common/actions'
import { KeyCode, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api'

/** @type {object.<string,IActionDescriptor>} */
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

/** @type {object.<string,IActionDescriptor>} */
export const md = {
  italic: createInlineBlockCommand('italic', {
    attrs: null,
    body_pre: '__',
    body_post: '__',
  }),
  bold: createInlineBlockCommand('bold', {
    attrs: null,
    body_pre: '**',
    body_post: '**',
  }),
  footnoteRef: createInlineBlockCommand('footnote-ref', {
    attrs: null,
    body_pre: '',
    body_post: '[^x]',
  }),
  footnoteContent: createDelimitedBlockCommand('footnote-content', {
    attrs: null,
    body_pre: '[^x]: ',
    delimiters: '',
    separator: ' '
  }),
  hyperlink: createInlineBlockCommand('hyperlink', {
    attrs: null,
    body_pre: '[',
    body_post: '](https://example.com)',
  }),
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
 * Registers actions as Command Palette items
 *
 * @param {ICodeEditor} editor
 * @param {TFunction} t
 * @param {object.<string, IActionDescriptor>} actions
 */
export function registerActions (editor, t, actions) {
  for (const action of Object.values(actions)) {
    editor.addAction(bindAction(editor, t, action))
  }
}

/**
 * Generates pandoc markdown-compliant inline code attributes
 * @see https://pandoc.org/MANUAL.html#extension-inline_code_attributes
 * @param {object} attributes
 * @param {Array.<string>} attributes.classNames
 * @param {{[key: string]: string}?} attributes.attrs
 * @returns {string}
 */
export function blockAttributes({ classNames = [], attrs = {} } = {}) {
  if (attrs === null || attrs === undefined) {
    return ''
  }

  const parts = [
    classNames.map((c) => `.${c}`),
    Object.entries(attrs).map(([key, value]) => `${key}="${value}"`),
  ]
    .flatMap((d) => d)
    .filter((d) => d)

  if (parts.length) {
    return `{${parts.join(' ')}}`
  }
}

/**
 * Generates a bunch of commands for Métopes syntax
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

export function MarkdownMenu ({ editor, t }) {
  const _bindAction = bindAction.bind(null, editor, t)

  return new SubmenuAction(
    'stylo--markdown--root',
    t('stylo.markdown.rootMenu'),
    [
      _bindAction(md.italic),
      _bindAction(md.bold),
      _bindAction(md.hyperlink),
      _bindAction(md.footnoteRef),
      _bindAction(md.footnoteContent),
    ]
  )
}
