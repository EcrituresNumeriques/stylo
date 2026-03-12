import { SubmenuAction } from 'monaco-editor/esm/vs/base/common/actions'
import {
  KeyCode,
  KeyMod,
  editor as _editor,
} from 'monaco-editor/esm/vs/editor/editor.api'

import createDelimitedBlockCommand from './delimited-block.js'
import {
  createEnclosingTextFormattingCommand,
  createEnclosingTextStyleCommand,
  createHyperlinkCommand,
  createInlineFootnoteCommand,
} from './inline-block.js'

export { Separator } from 'monaco-editor/esm/vs/base/common/actions'

/** @type {Record<string, Record<string, IActionDescriptor>>} */
export const actions = {
  md: {
    italic: createEnclosingTextFormattingCommand('italic', {
      formattingMark: '_',
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyI],
    }),
    bold: createEnclosingTextFormattingCommand('bold', {
      formattingMark: '**',
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyB],
    }),
    footnoteInline: createInlineFootnoteCommand('footnote-inline'),
    hyperlink: createHyperlinkCommand('hyperlink'),
  },
  metopes: {
    acknowledgement: createDelimitedBlockCommand('ack', {
      keybindings: [
        KeyMod.chord(
          KeyMod.CtrlCmd | KeyCode.KeyM,
          KeyMod.CtrlCmd | KeyCode.KeyA
        ),
      ],
    }),
    dedication: createDelimitedBlockCommand('dedi'),
    endnote: createDelimitedBlockCommand('endnote', {
      keybindings: [KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyD],
    }),
    epigraph: createDelimitedBlockCommand('epigraph', {
      contentBefore: '[@source]',
    }),
    figure: createDelimitedBlockCommand('figure', {
      contentBefore: '\n[titre]{.head}\n\n![caption](image.png)',
      contentAfter: ':::{.credits}\n[]{.credits} [@source]\n:::',
    }),
    outline: createDelimitedBlockCommand('outline', {
      attrs: { titre: 'valeurtitre' },
      className: 'encadre',
      contentAfter: '[[nom]{.name}[prenom]{.surname}]{.auth}',
    }),
    inlinequote: createEnclosingTextStyleCommand('inlinequote'),
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
      contentBefore: '[nom de personne]{.speaker}',
    }),
    quoteAlt: createDelimitedBlockCommand('quote-alt'),
    reponse: createDelimitedBlockCommand('answ', {
      contentBefore: '[nom de personne]{.speaker}',
    }),
    signature: createDelimitedBlockCommand('sig'),
    smallcaps: createEnclosingTextStyleCommand('smallcaps'),
    sponsor: createDelimitedBlockCommand('sponsor'),
  },
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
 * @param {ICodeEditor} editor
 * @param {TFunction} t
 * @param {IActionDescriptor} action
 * @returns {IActionDescriptor} bound action
 */
export function bindAction(editor, t, action) {
  return {
    ...action,
    enabled: true,
    label: t(action.label),
    run: action.run.bind(null, editor),
  }
}

/**
 * Registers actions as Command Palette items
 * @param {ICodeEditor} editor
 * @param {TFunction} t
 * @param {Record<string, IActionDescriptor>} actions
 * @param {object} [options]
 * @param {boolean} options.palette
 * @param {boolean} options.shortcuts
 */
export function registerActions(
  editor,
  t,
  actions,
  { palette = true, shortcuts = true } = {}
) {
  for (const action of Object.values(actions)) {
    // adding an entry in the command palette also registers its keybinding
    if (palette) {
      editor.addAction(bindAction(editor, t, action))
    } else {
      _editor.addCommand(bindAction(editor, t, action))
    }

    // adding the keybinding for the context menu
    if (shortcuts && action.keybindings?.at(0)) {
      _editor.addKeybindingRule({
        keybinding: action.keybindings.at(0),
        command: palette ? `${editor.getId()}:${action.id}` : action.id,
      })
    }
  }
}

/**
 * Generates pandoc markdown-compliant inline code attributes
 * @see https://pandoc.org/MANUAL.html#extension-inline_code_attributes
 * @param {object} [attributes]
 * @param {Array.<string>} attributes.classNames
 * @param {{[key: string]: string}?} attributes.attrs
 * @returns {string|undefined}
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
          _bindAction(actions.metopes.acknowledgement),
          _bindAction(actions.metopes.epigraph),
          _bindAction(actions.metopes.notepreAuthor),
          _bindAction(actions.metopes.noteprePublisher),
          _bindAction(actions.metopes.notepreTranslator),
          _bindAction(actions.metopes.endnote),
          _bindAction(actions.metopes.dedication),
          _bindAction(actions.metopes.sponsor),
        ]
      ),
      new SubmenuAction(
        'stylo--metopes--citations',
        t('stylo.metopes.citations'),
        [
          _bindAction(actions.metopes.inlinequote),
          _bindAction(actions.metopes.quoteAlt),
        ]
      ),
      new SubmenuAction('stylo--metopes--texte', t('stylo.metopes.texte'), [
        new SubmenuAction(
          'stylo--metopes--entretien',
          t('stylo.metopes.entretien'),
          [
            _bindAction(actions.metopes.question),
            _bindAction(actions.metopes.reponse),
          ]
        ),
        _bindAction(actions.metopes.signature),
        _bindAction(actions.metopes.smallcaps),
      ]),
      _bindAction(actions.metopes.figure),
      _bindAction(actions.metopes.outline),
    ]
  )
}

export function MarkdownMenu({ editor, t }) {
  const _bindAction = bindAction.bind(null, editor, t)

  return new SubmenuAction(
    'stylo--markdown--root',
    t('stylo.markdown.rootMenu'),
    [
      _bindAction(actions.md.italic),
      _bindAction(actions.md.bold),
      _bindAction(actions.md.hyperlink),
      _bindAction(actions.md.footnoteInline),
    ]
  )
}
