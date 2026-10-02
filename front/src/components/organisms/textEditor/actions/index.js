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

const actionTypes = {
  BLOCK: 'block',
  DELIMITED_BLOCK: 'delimited-block',
  INLINE: 'inline',
  ENCLOSING: 'enclosing',
  HYPERLINK: 'hyperlink',
}

const factories = {
  [actionTypes.BLOCK]: (id, { content, options }) =>
    createBlockCommand(id, content, options),
  [actionTypes.DELIMITED_BLOCK]: (id, { options }) =>
    createDelimitedBlockCommand(id, options),
  [actionTypes.INLINE]: (id, { options }) =>
    createInlineBlockCommand(id, options),
  [actionTypes.ENCLOSING]: (id, { options }) =>
    createEnclosingTextFormattingCommand(id, options),
  [actionTypes.HYPERLINK]: (id) => createHyperlinkCommand(id),
}

/**
 * @typedef {object} ActionSchema
 * @property {string} type - One of `actionTypes`, selects the command factory
 * @property {string|(t: TFunction) => string} [content] - Content inserted by `BLOCK` actions
 * @property {object} [options] - Options passed to the command factory
 * @property {{ block?: string[], inline?: string[] }} [classes] - Additional classes found in the inserted content
 */

/**
 * Actions, grouped by namespace. Keys are the command ids.
 * @type {Record<string, Record<string, ActionSchema>>}
 */
export const actionsSchema = {
  markdown: {
    blockquote: {
      type: actionTypes.BLOCK,
      content: '> \n> \n> ',
    },
    section1: {
      type: actionTypes.BLOCK,
      content: '# ',
    },
    section2: {
      type: actionTypes.BLOCK,
      content: '## ',
    },
    section3: {
      type: actionTypes.BLOCK,
      content: '### ',
    },
    section4: {
      type: actionTypes.BLOCK,
      content: '#### ',
    },
    section5: {
      type: actionTypes.BLOCK,
      content: '##### ',
    },
    section6: {
      type: actionTypes.BLOCK,
      content: '###### ',
    },
    separator: {
      type: actionTypes.BLOCK,
      content: '---',
    },
    strikethrough: {
      type: actionTypes.ENCLOSING,
      options: {
        formattingMark: '~~',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyD],
      },
    },
    italic: {
      type: actionTypes.ENCLOSING,
      options: {
        formattingMark: '_',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyI],
      },
    },
    bold: {
      type: actionTypes.ENCLOSING,
      options: {
        formattingMark: '**',
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyB],
      },
    },
    sub: { type: actionTypes.ENCLOSING, options: { formattingMark: '~' } },
    sup: { type: actionTypes.ENCLOSING, options: { formattingMark: '^' } },
    footnote: {
      type: actionTypes.INLINE,
      options: {
        contentBefore: '^[',
        keybindings: [KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyF],
      },
    },
    hyperlink: { type: actionTypes.HYPERLINK },
  },
  metopes: {
    refs: {
      type: actionTypes.BLOCK,
      content: (t) => `\n\n## ${t('actions.preamble.refs')}`,
      options: {
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
      },
    },
    ack: {
      type: actionTypes.DELIMITED_BLOCK,
      options: {
        keybindings: [
          KeyMod.chord(
            KeyMod.CtrlCmd | KeyCode.KeyM,
            KeyMod.CtrlCmd | KeyCode.KeyA
          ),
        ],
      },
    },
    answer: {
      type: actionTypes.DELIMITED_BLOCK,
      options: { contentBefore: '[nom de personne]{.speaker}' },
      classes: { inline: ['speaker'] },
    },
    argument: { type: actionTypes.DELIMITED_BLOCK },
    credits: { type: actionTypes.DELIMITED_BLOCK },
    dedication: { type: actionTypes.DELIMITED_BLOCK },
    epigraph: {
      type: actionTypes.DELIMITED_BLOCK,
      options: {
        contentBefore: ':::{.rich-quote}\n',
        contentAfter: '\n[@source]\n:::',
      },
      classes: { block: ['rich-quote'] },
    },
    figure: {
      type: actionTypes.DELIMITED_BLOCK,
      options: {
        contentBefore: '\n[titre]{.head}\n',
        contentAfter: '\n![caption](image.png)',
      },
      classes: { inline: ['head'] },
    },
    linguistic: {
      type: actionTypes.DELIMITED_BLOCK,
      options: {
        attrs: { lang: 'lang-value', num: '123', label: 'value' },
        contentBefore: '> ',
        contentAfter:
          '> \n[@<source>]\n\n:::{.translation lang="lang-value"}\n> \n> \n[@<source>]\n:::\n\n:::{.translation lang="lang-value"}\n> \n> \n> \n:::\n',
      },
      classes: { block: ['translation'] },
    },
    outline: {
      type: actionTypes.DELIMITED_BLOCK,
      options: {
        className: 'box',
        contentBefore: '\n[titre]{.head}\n',
        contentAfter: '\n[[nom]{.name} [prenom]{.surname}]{.aut}',
      },
      classes: {
        block: ['outline'],
        inline: ['head', 'name', 'surname', 'aut'],
      },
    },
    'prenote-aut': {
      type: actionTypes.DELIMITED_BLOCK,
      options: { attrs: { origin: 'aut' }, className: 'prenote' },
    },
    'prenote-pbl': {
      type: actionTypes.DELIMITED_BLOCK,
      options: { attrs: { origin: 'pbl' }, className: 'prenote' },
    },
    'prenote-tr': {
      type: actionTypes.DELIMITED_BLOCK,
      options: { attrs: { origin: 'tr' }, className: 'prenote' },
    },
    question: {
      type: actionTypes.DELIMITED_BLOCK,
      options: { contentBefore: '[nom de personne]{.speaker}' },
      classes: { inline: ['speaker'] },
    },
    'quote-alt': { type: actionTypes.DELIMITED_BLOCK },
    'quote-rich': {
      type: actionTypes.DELIMITED_BLOCK,
      options: {
        className: 'rich-quote',
        attrs: { lang: 'lang-value' },
        contentBefore: '> ',
        contentAfter:
          '> \n[@<source>]\n\n:::{.translation lang="lang-value"}\n> \n> \n[@<source>]\n:::\n\n:::{.translation lang="lang-value"}\n> \n> \n> \n:::\n',
      },
      classes: { block: ['translation'] },
    },
    sig: { type: actionTypes.DELIMITED_BLOCK },
    sponsor: { type: actionTypes.DELIMITED_BLOCK },
    translation: {
      type: actionTypes.DELIMITED_BLOCK,
      options: { attrs: { lang: 'lang-value' } },
    },
    'credits-inline': {
      type: actionTypes.INLINE,
      options: { className: 'credits' },
    },
    endnote: {
      type: actionTypes.INLINE,
      options: {
        className: 'endnote',
        keybindings: [KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyD],
      },
    },
    'index-entry': {
      type: actionTypes.INLINE,
      options: {
        className: 'index-type',
        attrs: { idref: () => self.crypto.randomUUID() },
      },
    },
    'quote-inline': {
      type: actionTypes.INLINE,
      options: { className: 'inlinequote' },
    },
    smallcaps: {
      type: actionTypes.INLINE,
      options: { className: 'smallcaps' },
    },
    surtitle: {
      type: actionTypes.INLINE,
      options: { className: 'surtitle' },
    },
    verse: {
      type: actionTypes.INLINE,
      options: {
        className: 'verse',
        contentBefore: '> [',
        attrs: { num: '123' },
      },
    },
  },
}

/**
 * Turns a static actions schema namespace into Monaco action descriptors,
 * keeping the same keys.
 * @param {string} namespace
 * @returns {Record<string, IActionDescriptor>}
 */
export function buildActions(namespace) {
  return Object.fromEntries(
    Object.entries(actionsSchema[namespace]).map(([key, action]) => [
      key,
      {
        ...factories[action.type](key, action),
        id: `stylo--${namespace}--${action.type}--${key}`,
      },
    ])
  )
}

/**
 * Lists the block and inline classes an actions namespace can insert.
 * @param {string} namespace
 * @returns {{ blocks: Set<string>, inlines: Set<string> }}
 */
export function knownClasses(namespace) {
  const blocks = new Set()
  const inlines = new Set()

  const classesByType = {
    [actionTypes.DELIMITED_BLOCK]: blocks,
    [actionTypes.INLINE]: inlines,
  }

  for (const [key, action] of Object.entries(actionsSchema[namespace])) {
    // Only fenced divs default their class to the command id
    const className =
      action.options?.className ??
      (action.type === actionTypes.DELIMITED_BLOCK ? key : null)

    if (className) {
      classesByType[action.type]?.add(className)
    }
    for (const c of action.classes?.block ?? []) blocks.add(c)
    for (const c of action.classes?.inline ?? []) inlines.add(c)
  }

  return { blocks, inlines }
}

/** @type {Record<string, Record<string, IActionDescriptor>>} */
export const actions = {
  markdown: buildActions('markdown'),
  metopes: buildActions('metopes'),
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
  const list = Array.isArray(actions) ? actions : Object.values(actions)

  for (const action of list) {
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
          _bindAction(actions.metopes.ack),
          _bindAction(actions.metopes.argument),
          _bindAction(actions.metopes.epigraph),
          _bindAction(actions.metopes['prenote-aut']),
          _bindAction(actions.metopes['prenote-pbl']),
          _bindAction(actions.metopes['prenote-tr']),
          _bindAction(actions.metopes.dedication),
          _bindAction(actions.metopes.sponsor),
        ]
      ),
      new SubmenuAction(
        'stylo--metopes--citations',
        t('stylo.metopes.citations'),
        [
          _bindAction(actions.metopes['quote-inline']),
          _bindAction(actions.metopes['quote-alt']),
          _bindAction(actions.metopes.refs),
          _bindAction(actions.metopes['quote-rich']),
          _bindAction(actions.metopes.verse),
        ]
      ),
      new SubmenuAction('stylo--metopes--texte', t('stylo.metopes.texte'), [
        new SubmenuAction(
          'stylo--metopes--entretien',
          t('stylo.metopes.entretien'),
          [
            _bindAction(actions.metopes.question),
            _bindAction(actions.metopes.answer),
          ]
        ),
        _bindAction(actions.metopes.endnote),
        _bindAction(actions.metopes['index-entry']),
        _bindAction(actions.metopes.linguistic),
        _bindAction(actions.metopes.sig),
        _bindAction(actions.metopes.smallcaps),
        _bindAction(actions.metopes.surtitle),
        _bindAction(actions.metopes.translation),
      ]),
      new SubmenuAction('stylo--metopes--figure', t('stylo.metopes.figure'), [
        _bindAction(actions.metopes.figure),
        _bindAction(actions.metopes.credits),
        _bindAction(actions.metopes['credits-inline']),
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
      _bindAction(actions.markdown.hyperlink),
      _bindAction(actions.markdown.italic),
      _bindAction(actions.markdown.bold),
      _bindAction(actions.markdown.strikethrough),
      _bindAction(actions.markdown.blockquote),
      _bindAction(actions.markdown.sub),
      _bindAction(actions.markdown.sup),
      _bindAction(actions.markdown.footnote),
      _bindAction(actions.markdown.separator),
      new SubmenuAction(
        'stylo--markdown--headings',
        t('stylo.markdown.headings'),
        [
          _bindAction(actions.markdown.section1),
          _bindAction(actions.markdown.section2),
          _bindAction(actions.markdown.section3),
          _bindAction(actions.markdown.section4),
          _bindAction(actions.markdown.section5),
          _bindAction(actions.markdown.section6),
        ]
      ),
    ]
  )
}
