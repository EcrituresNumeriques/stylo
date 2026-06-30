import { SubmenuAction } from 'monaco-editor/esm/vs/base/common/actions'
import {
  editor as _editor,
  KeyCode,
  KeyMod,
  Selection,
} from 'monaco-editor/esm/vs/editor/editor.api'

import createDelimitedBlockCommand, {
  createBlockCommand,
} from './delimited-block.js'
import createInlineBlockCommand, {
  createEnclosingTextFormattingCommand,
  createHyperlinkCommand,
} from './inline-block.js'

export { Separator } from 'monaco-editor/esm/vs/base/common/actions'

/** @type {Record<string, Record<string, IActionDescriptor>>} */
export const actions = {
  md: {
    citation: createBlockCommand('citation', '> \n> \n> '),
    delete: createEnclosingTextFormattingCommand('delete', {
      formattingMark: '~~',
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyD],
    }),
    headline1: createBlockCommand('section1', '# '),
    headline2: createBlockCommand('section2', '## '),
    headline3: createBlockCommand('section3', '### '),
    headline4: createBlockCommand('section4', '#### '),
    headline5: createBlockCommand('section5', '##### '),
    headline6: createBlockCommand('section6', '###### '),
    italic: createEnclosingTextFormattingCommand('italic', {
      formattingMark: '_',
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyI],
    }),
    bold: createEnclosingTextFormattingCommand('bold', {
      formattingMark: '**',
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyB],
    }),
    footnote: createInlineBlockCommand('footnote', {
      contentBefore: '^[',
      keybindings: [KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyF],
    }),
    hyperlink: createHyperlinkCommand('hyperlink'),
    separator: createBlockCommand('separator', '---'),
    sub: createEnclosingTextFormattingCommand('sub', {
      formattingMark: '~',
    }),
    sup: createEnclosingTextFormattingCommand('sup', {
      formattingMark: '^',
    }),
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
    argument: createDelimitedBlockCommand('argument'),
    credits: createDelimitedBlockCommand('credits'),
    dedication: createDelimitedBlockCommand('dedication'),
    inlineCredits: createInlineBlockCommand('credits', {
      className: 'credits',
    }),
    endnote: createInlineBlockCommand('endnote', {
      className: 'endnote',
      keybindings: [KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyD],
    }),
    epigraph: createDelimitedBlockCommand('epigraph', {
      contentBefore: ':::{.rich-quote}\n',
      contentAfter: '\n[@source]\n:::',
    }),
    figure: createDelimitedBlockCommand('figure', {
      contentBefore: '\n[titre]{.head}\n',
      contentAfter: '\n![caption](image.png)',
    }),
    indexEntry: createInlineBlockCommand('index-entry', {
      className: 'index-type',
      attrs: { idref: () => self.crypto.randomUUID() },
    }),
    outline: createDelimitedBlockCommand('outline', {
      className: 'box',
      contentBefore: '\n[titre]{.head}\n',
      contentAfter: '\n[[nom]{.name} [prenom]{.surname}]{.aut}',
    }),
    inlineQuote: createInlineBlockCommand('inlinequote', {
      className: 'inlinequote',
    }),
    linguistic: createDelimitedBlockCommand('linguistic', {
      attrs: { lang: 'lang-value', num: '123', label: 'value' },
      contentBefore: '> ',
      contentAfter:
        '> \n[@<source>]\n\n:::{.translation lang="lang-value"}\n> \n> \n[@<source>]\n:::\n\n:::{.translation lang="lang-value"}\n> \n> \n> \n:::\n',
    }),
    prenoteAuthor: createDelimitedBlockCommand('prenote.aut', {
      attrs: { origin: 'aut' },
      className: 'prenote',
    }),
    prenotePublisher: createDelimitedBlockCommand('prenote.pbl', {
      attrs: { origin: 'pbl' },
      className: 'prenote',
    }),
    prenoteTranslator: createDelimitedBlockCommand('prenote.tr', {
      attrs: { origin: 'tr' },
      className: 'prenote',
    }),
    question: createDelimitedBlockCommand('question', {
      contentBefore: '[nom de personne]{.speaker}',
    }),
    altQuote: createDelimitedBlockCommand('quote-alt'),
    refs: createBlockCommand(
      'refs',
      (t) => `\n\n## ${t('actions.preamble.refs')}`,
      {
        // returns the cursor to its initial position
        endCursorState({ selection }) {
          return selection
        },
        // insert content at the last char of the last column
        selectionState(editor) {
          const model = editor.getModel()
          const lastLineNumber = model.getLineCount()
          const lastLineMaxChar = model.getLineMaxColumn(lastLineNumber)

          return new Selection(
            lastLineNumber,
            lastLineMaxChar,
            lastLineNumber,
            lastLineMaxChar
          )
        },
      }
    ),
    richQuote: createDelimitedBlockCommand('rich-quote', {
      attrs: { lang: 'lang-value' },
      contentBefore: '> ',
      contentAfter:
        '> \n[@<source>]\n\n:::{.translation lang="lang-value"}\n> \n> \n[@<source>]\n:::\n\n:::{.translation lang="lang-value"}\n> \n> \n> \n:::\n',
    }),
    reponse: createDelimitedBlockCommand('answer', {
      contentBefore: '[nom de personne]{.speaker}',
    }),
    signature: createDelimitedBlockCommand('sig'),
    smallcaps: createInlineBlockCommand('smallcaps', {
      className: 'smallcaps',
    }),
    sponsor: createDelimitedBlockCommand('sponsor'),
    surtitle: createInlineBlockCommand('surtitle', { className: 'surtitle' }),
    translation: createDelimitedBlockCommand('translation', {
      attrs: { lang: 'lang-value' },
    }),
    verse: createInlineBlockCommand('verse', {
      className: 'verse',
      contentBefore: '> [',
      attrs: { num: '123' },
    }),
  },
  saveShortcut(run) {
    return [
      {
        id: 'stylo--save-version',
        label: 'actions.save-version',
        contextMenuGroupId: '1_modification',
        contextMenuOrder: 1,
        keybindingContext: null,
        enabled: true,
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        run,
      },
    ]
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
    run: action.run.bind(null, editor, t),
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
 * @param {{[key: string]: string}?} attributes.attrs key/value attributes
 * @returns {string|undefined}
 */
export function blockAttributes({ classNames = [], attrs = {} } = {}) {
  if (attrs === null || attrs === undefined) {
    return ''
  }

  const id = Object.hasOwn(attrs, 'id') ? attrs.id : null

  const parts = [
    id ? `#${id}` : null,
    classNames
      .filter((d) => d)
      .flatMap((c) => c.split(','))
      .map((c) => `.${c.trim()}`),
    Object.entries(attrs)
      .filter(([key]) => key !== 'id')
      .map(
        ([key, value]) =>
          `${key}="${typeof value === 'function' ? value(key) : value}"`
      ),
  ]
    .flat()
    .filter((d) => d)

  return parts.length ? `{${parts.join(' ')}}` : ''
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
          _bindAction(actions.metopes.argument),
          _bindAction(actions.metopes.epigraph),
          _bindAction(actions.metopes.prenoteAuthor),
          _bindAction(actions.metopes.prenotePublisher),
          _bindAction(actions.metopes.prenoteTranslator),
          _bindAction(actions.metopes.dedication),
          _bindAction(actions.metopes.sponsor),
        ]
      ),
      new SubmenuAction(
        'stylo--metopes--citations',
        t('stylo.metopes.citations'),
        [
          _bindAction(actions.metopes.inlineQuote),
          _bindAction(actions.metopes.altQuote),
          _bindAction(actions.metopes.refs),
          _bindAction(actions.metopes.richQuote),
          _bindAction(actions.metopes.verse),
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
        _bindAction(actions.metopes.endnote),
        _bindAction(actions.metopes.indexEntry),
        _bindAction(actions.metopes.linguistic),
        _bindAction(actions.metopes.signature),
        _bindAction(actions.metopes.smallcaps),
        _bindAction(actions.metopes.surtitle),
        _bindAction(actions.metopes.translation),
      ]),
      new SubmenuAction('stylo--metopes--figure', t('stylo.metopes.figure'), [
        _bindAction(actions.metopes.figure),
        _bindAction(actions.metopes.credits),
        _bindAction(actions.metopes.inlineCredits),
      ]),
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
      _bindAction(actions.md.hyperlink),
      _bindAction(actions.md.italic),
      _bindAction(actions.md.bold),
      _bindAction(actions.md.delete),
      _bindAction(actions.md.citation),
      _bindAction(actions.md.sub),
      _bindAction(actions.md.sup),
      _bindAction(actions.md.footnote),
      _bindAction(actions.md.separator),
      new SubmenuAction(
        'stylo--markdown--headings',
        t('stylo.markdown.headings'),
        [
          _bindAction(actions.md.headline1),
          _bindAction(actions.md.headline2),
          _bindAction(actions.md.headline3),
          _bindAction(actions.md.headline4),
          _bindAction(actions.md.headline5),
          _bindAction(actions.md.headline6),
        ]
      ),
    ]
  )
}
