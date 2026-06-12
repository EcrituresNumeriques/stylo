import { describe, expect, test } from 'vitest'

import { preprocessPandocDivs, processor } from './index.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findNodes(tree, type) {
  const found = []
  function walk(node) {
    if (node.type === type) found.push(node)
    for (const child of node.children ?? []) walk(child)
  }
  walk(tree)
  return found
}

function containerDirectives(md) {
  return findNodes(processor.parse(md), 'containerDirective')
}

function containerDirectivesFromPandoc(md) {
  return containerDirectives(preprocessPandocDivs(md))
}

// `preprocessPandocDivs` converts pandoc-style `:::{.class}` to the
// remark-directive format `:::class{.class}` so that remark can parse it.

describe('preprocessPandocDivs() — basic transformation', () => {
  test('adds the class name between the colons and the opening brace', () => {
    expect(preprocessPandocDivs(':::{.figure}')).toBe(':::figure{.figure}')
  })

  test('preserves attributes alongside the class', () => {
    expect(
      preprocessPandocDivs(':::{.rich-quote lang="fr" origin="aut"}')
    ).toBe(':::rich-quote{.rich-quote lang="fr" origin="aut"}')
  })

  test('uses "div" as name when no class is present', () => {
    expect(preprocessPandocDivs(':::{lang="fr"}')).toBe(':::div{lang="fr"}')
  })

  test('uses "div" as name for empty braces', () => {
    expect(preprocessPandocDivs(':::{}')).toBe(':::div{}')
  })

  test('uses first class when multiple classes are declared', () => {
    expect(preprocessPandocDivs(':::{.rich-quote .secondary}')).toBe(
      ':::rich-quote{.rich-quote .secondary}'
    )
  })
})

describe('preprocessPandocDivs() — fence length', () => {
  test('extended fence (4 colons) is transformed correctly', () => {
    expect(preprocessPandocDivs('::::{.figure}')).toBe('::::figure{.figure}')
  })

  test('extended fence (5 colons) is transformed correctly', () => {
    expect(preprocessPandocDivs(':::::{.outline}')).toBe(
      ':::::outline{.outline}'
    )
  })
})

describe('preprocessPandocDivs() — multiline documents', () => {
  test('transforms only opening fences and leaves other lines unchanged', () => {
    const md = `:::{.figure}
![caption](image.png)
:::
some text`
    const result = preprocessPandocDivs(md)
    expect(result).toBe(`:::figure{.figure}
![caption](image.png)
:::
some text`)
  })

  test('transforms all opening fences in a document', () => {
    const md = `:::{.figure}
:::
:::{.outline}
:::`
    const result = preprocessPandocDivs(md)
    expect(result).toBe(`:::figure{.figure}
:::
:::outline{.outline}
:::`)
  })

  test('transforms nested fences independently', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::
:::`
    const result = preprocessPandocDivs(md)
    expect(result).toBe(`:::rich-quote{.rich-quote}
:::translation{.translation lang="fr"}
:::
:::`)
  })
})

describe('preprocessPandocDivs() — lines that are NOT transformed', () => {
  // Only `:::{...}` at the start of a line is converted.
  test('closing fence `:::` is left unchanged', () => {
    expect(preprocessPandocDivs(':::')).toBe(':::')
  })

  test('remark-directive format `:::name{...}` is not double-transformed', () => {
    // The regex requires `{` immediately after `:::+`, so `:::name{...}` is not matched.
    const input = ':::figure{.figure}'
    expect(preprocessPandocDivs(input)).toBe(input)
  })

  test('indented opening fence is not transformed', () => {
    const input = '  :::{.figure}'
    expect(preprocessPandocDivs(input)).toBe(input)
  })

  test('opening fence with trailing text after `}` is transformed', () => {
    // The regex does NOT require `\s*$`, so trailing content is kept but the
    // fence opening is still converted. remark-directive will then reject it.
    expect(preprocessPandocDivs(':::{.figure} trailing')).toBe(
      ':::figure{.figure} trailing'
    )
  })
})

// ─── remark processor (unified + remark-parse + remark-directive) ─────────────

describe('processor — syntaxes recognised as containerDirective', () => {
  test('`:::name` without attributes produces a containerDirective', () => {
    const md = `:::figure\ncontent\n:::`
    const [node] = containerDirectives(md)
    expect(node).toBeDefined()
    expect(node.name).toBe('figure')
    expect(node.attributes).toEqual({})
  })

  test('`:::name{.class}` is recognised with class attribute', () => {
    const md = `:::figure{.figure}\ncontent\n:::`
    const [node] = containerDirectives(md)
    expect(node).toBeDefined()
    expect(node.name).toBe('figure')
    expect(node.attributes.class).toBe('figure')
  })

  test('`:::name{key="val"}` is recognised with custom attribute', () => {
    const md = `:::translation{lang="fr"}\ncontent\n:::`
    const [node] = containerDirectives(md)
    expect(node).toBeDefined()
    expect(node.name).toBe('translation')
    expect(node.attributes.lang).toBe('fr')
  })

  test('`:::name{.class key="val"}` preserves both class and attribute', () => {
    const md = `:::prenote{.prenote origin="aut"}\ncontent\n:::`
    const [node] = containerDirectives(md)
    expect(node.attributes.class).toBe('prenote')
    expect(node.attributes.origin).toBe('aut')
  })

  test('nested directives are both recognised', () => {
    const md = `:::rich-quote\n:::translation{lang="fr"}\n:::\n:::`
    const nodes = containerDirectives(md)
    expect(nodes).toHaveLength(2)
    expect(nodes[0].name).toBe('rich-quote')
    expect(nodes[1].name).toBe('translation')
  })
})

describe('processor — syntaxes NOT recognised as containerDirective', () => {
  test('pandoc-style `:::{.class}` is NOT recognised without preprocessing', () => {
    // The `{` immediately after `:::` is not valid remark-directive syntax.
    const md = `:::{.figure}\ncontent\n:::`
    expect(containerDirectives(md)).toHaveLength(0)
  })

  test('pandoc-style `:::{.class}` IS recognised after preprocessing', () => {
    const md = `:::{.figure}\ncontent\n:::`
    const [node] = containerDirectivesFromPandoc(md)
    expect(node).toBeDefined()
    expect(node.name).toBe('figure')
    expect(node.attributes.class).toBe('figure')
  })

  test('`:::name` with trailing text on the same line is NOT recognised', () => {
    // remark-directive requires the opening fence to end right after the attributes.
    const md = `:::figure extra text\ncontent\n:::`
    expect(containerDirectives(md)).toHaveLength(0)
  })

  test('extended opening fence `::::name` is recognised with any closing fence', () => {
    // remark-directive does NOT require the closing fence to match the opening length.
    // Both `:::` and `::::` close a `::::name` block correctly.
    const mdShortClose = `::::figure\ncontent\n:::`
    const [nodeShort] = containerDirectives(mdShortClose)
    expect(nodeShort).toBeDefined()
    expect(nodeShort.name).toBe('figure')

    const mdMatchingClose = `::::figure\ncontent\n::::`
    const [nodeMatch] = containerDirectives(mdMatchingClose)
    expect(nodeMatch).toBeDefined()
    expect(nodeMatch.name).toBe('figure')
  })
})
