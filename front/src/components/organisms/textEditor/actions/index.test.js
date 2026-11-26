import { describe, expect, test } from 'vitest'

import {
  actionTypes,
  blockAttributes,
  knownClasses,
  snippetItems,
} from './index.js'

describe('blockAttributes', () => {
  test('works with a single className', () => {
    expect(blockAttributes({ classNames: ['ack'] })).toEqual('{.ack}')
  })

  test('works with a single attribute', () => {
    expect(blockAttributes({ attrs: { origine: 'valeur' } })).toEqual(
      '{origine="valeur"}'
    )
  })

  test('works with a combination of both', () => {
    expect(
      blockAttributes({
        classNames: ['ack', 'sponsor'],
        attrs: { origine: 'valeur', lang: 'fr' },
      })
    ).toEqual('{.ack .sponsor origine="valeur" lang="fr"}')
  })

  test('returns nothing if attrs empty', () => {
    expect(
      blockAttributes({
        classNames: ['ack', 'sponsor'],
        attrs: null,
      })
    ).toEqual('')
  })
})

describe('knownClasses', () => {
  test('ignores actions which insert no class', () => {
    const { blocks, inlines } = knownClasses('markdown')
    expect([...blocks]).toEqual([])
    expect([...inlines]).toEqual([])
  })

  test('defaults fenced div classes to the command id', () => {
    const { blocks, inlines } = knownClasses('metopes')
    expect(blocks.has('argument')).toBe(true)
    expect(inlines.has('credits')).toBe(true)
  })
})

describe('snippetItems', () => {
  const editor = { getId: () => 'vs.editor.ICodeEditor:1' }
  const t = (key) => `t(${key})`

  test('keeps the actions of the requested types', () => {
    const items = snippetItems('metopes', editor, t, {
      types: [actionTypes.DELIMITED_BLOCK],
    })
    const labels = items.map(({ label }) => label)
    expect(labels).toContain('epigraph')
    expect(labels).toContain('prenote-aut')
    expect(labels).not.toContain('refs')
    expect(labels).not.toContain('smallcaps')
  })

  test('binds each item to the editor command of its action', () => {
    const [ack] = snippetItems('metopes', editor, t, {
      types: [actionTypes.DELIMITED_BLOCK],
    })
    expect(ack).toEqual({
      label: 'ack',
      detail: 't(actions.infratextual-block.ack)',
      commandId: 'vs.editor.ICodeEditor:1:stylo--metopes--delimited-block--ack',
    })
  })

  test('returns nothing when no action has the requested types', () => {
    expect(snippetItems('markdown', editor, t, { types: ['unknown'] })).toEqual(
      []
    )
  })
})
