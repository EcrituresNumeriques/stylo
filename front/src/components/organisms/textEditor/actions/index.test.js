import { describe, expect, test } from 'vitest'

import { actionTypes, knownClasses, snippetItems } from './index.js'

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
