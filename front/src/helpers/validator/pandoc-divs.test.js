import { describe, expect, test } from 'vitest'

import { parsePandocFencedDivs, walkDivs } from './pandoc-divs.js'

describe('parsePandocFencedDivs()', () => {
  test('returns empty array for plain text', () => {
    expect(parsePandocFencedDivs('just some text\nno divs here')).toEqual([])
  })

  test('parses a single flat div', () => {
    const md = `:::{.figure}
content
:::`
    const [div] = parsePandocFencedDivs(md)
    expect(div.className).toBe('figure')
    expect(div.startLine).toBe(1)
    expect(div.endLine).toBe(3)
    expect(div.children).toHaveLength(0)
  })

  test('parses attributes', () => {
    const md = `:::{.rich-quote lang="fr" origin="aut"}
:::`
    const [div] = parsePandocFencedDivs(md)
    expect(div.attrs.lang).toBe('fr')
    expect(div.attrs.origin).toBe('aut')
    expect(div.attrs._class).toBe('rich-quote')
  })

  test('parses nested divs', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::
:::`
    const [outer] = parsePandocFencedDivs(md)
    expect(outer.className).toBe('rich-quote')
    expect(outer.children).toHaveLength(1)
    expect(outer.children[0].className).toBe('translation')
    expect(outer.children[0].attrs.lang).toBe('fr')
  })

  test('parses multiple consecutive nested divs at same depth', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::

:::{.translation lang="en"}
:::

:::`
    const [outer] = parsePandocFencedDivs(md)
    expect(outer.className).toBe('rich-quote')
    expect(outer.children).toHaveLength(2)
    expect(outer.children[0].attrs.lang).toBe('fr')
    expect(outer.children[1].attrs.lang).toBe('en')
  })

  test('parses two top-level sibling divs', () => {
    const md = `:::{.figure}
:::
:::{.outline}
:::`
    const divs = parsePandocFencedDivs(md)
    expect(divs).toHaveLength(2)
    expect(divs[0].className).toBe('figure')
    expect(divs[1].className).toBe('outline')
  })

  test('records correct line numbers', () => {
    const md = `first line
:::{.figure}
content
:::
last line`
    const [div] = parsePandocFencedDivs(md)
    expect(div.startLine).toBe(2)
    expect(div.endLine).toBe(4)
  })
})

describe('walkDivs()', () => {
  test('visits all nodes depth-first', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::
:::{.translation lang="en"}
:::
:::`
    const divs = parsePandocFencedDivs(md)
    const visited = []
    walkDivs(divs, (node) => visited.push(node.className))
    expect(visited).toEqual(['rich-quote', 'translation', 'translation'])
  })
})

// ─── Edge cases ──────────────────────────────────────────────────────────────

describe('parsePandocFencedDivs() — fence length', () => {
  test('extended fence (4 colons) is recognised as an opening', () => {
    const md = `::::{.figure}
content
:::`
    const [div] = parsePandocFencedDivs(md)
    expect(div).toBeDefined()
    expect(div.className).toBe('figure')
  })

  test('extended fence (5 colons) is recognised as an opening', () => {
    const md = `:::::{.outline}
content
:::`
    const [div] = parsePandocFencedDivs(md)
    expect(div).toBeDefined()
    expect(div.className).toBe('outline')
  })

  // The closing fence must be exactly `:::` (3 colons).
  // A line with more colons (`::::`) is NOT treated as a closer.
  test('closing fence with more than 3 colons is NOT recognised', () => {
    const md = `:::{.figure}
content
::::` // not a valid closer
    const [div] = parsePandocFencedDivs(md)
    // The div is left open and its endLine is set to the last line of the document
    expect(div.endLine).toBe(3)
    expect(div.className).toBe('figure')
  })
})

describe('parsePandocFencedDivs() — class and attribute variants', () => {
  test('first class wins when multiple classes are declared', () => {
    const md = `:::{.rich-quote .secondary}
:::`
    const [div] = parsePandocFencedDivs(md)
    // Only the first class is captured; subsequent classes are in attrs but ignored by className
    expect(div.className).toBe('rich-quote')
    expect(div.attrs._class).toBe('rich-quote')
  })

  test('no class — className is empty string', () => {
    const md = `:::{lang="fr"}
:::`
    const [div] = parsePandocFencedDivs(md)
    expect(div.className).toBe('')
    expect(div.attrs.lang).toBe('fr')
    expect(div.attrs._class).toBeUndefined()
  })

  test('empty braces — className is empty string', () => {
    const md = `:::{}
:::`
    const [div] = parsePandocFencedDivs(md)
    expect(div.className).toBe('')
  })

  test('multiple key=value attributes are all parsed', () => {
    const md = `:::{.prenote origin="aut" lang="fr"}
:::`
    const [div] = parsePandocFencedDivs(md)
    expect(div.attrs.origin).toBe('aut')
    expect(div.attrs.lang).toBe('fr')
    expect(div.attrs._class).toBe('prenote')
  })
})

describe('parsePandocFencedDivs() — unclosed divs', () => {
  test('unclosed div gets endLine set to last line of document', () => {
    const md = `:::{.figure}
content line 1
content line 2`
    const [div] = parsePandocFencedDivs(md)
    expect(div.endLine).toBe(3)
  })

  test('inner unclosed div gets endLine set to last line', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::` // closes rich-quote, translation is unclosed
    const [outer] = parsePandocFencedDivs(md)
    // The `:::` on line 3 closes rich-quote, so translation is left unclosed
    // In this parser the stack is popped LIFO, so `:::` closes translation first
    expect(outer.children[0].className).toBe('translation')
  })
})

describe('parsePandocFencedDivs() — unsupported syntax', () => {
  // Opening fence without `{...}` (plain `:::` or `:::name`) is NOT recognised as a div.
  test('plain `:::` open fence without braces is ignored', () => {
    const md = `:::
content
:::`
    expect(parsePandocFencedDivs(md)).toHaveLength(0)
  })

  test('remark-directive style `:::name{.name}` is NOT recognised', () => {
    // The parser expects `:::{...}` not `:::name{...}`
    const md = `:::figure{.figure}
content
:::`
    expect(parsePandocFencedDivs(md)).toHaveLength(0)
  })

  test('opening fence with trailing content after closing brace is ignored', () => {
    const md = `:::{.figure} extra text
content
:::`
    // The regex requires \s*$ after `}`, so extra text prevents a match
    expect(parsePandocFencedDivs(md)).toHaveLength(0)
  })

  test('indented opening fence is NOT recognised', () => {
    // The `^` anchor in multiline mode requires the match to start at line start
    const md = `  :::{.figure}
content
:::`
    expect(parsePandocFencedDivs(md)).toHaveLength(0)
  })
})
