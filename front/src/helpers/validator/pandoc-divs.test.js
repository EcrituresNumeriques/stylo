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
