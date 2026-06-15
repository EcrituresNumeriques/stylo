import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'

import {
  figureMustContainImage,
  indexEntryRequiresIdref,
  prenoteRequiresOrigin,
  questionAnswerTextOnly,
  singleEpigraphClass,
  translationNotNested,
  translationRequiresLang,
  unknownBlockClass,
  unknownInlineClass,
} from './metopes.js'

function makeTree(md) {
  const preprocessed = md.replace(
    /^(:::+)\{([^}]*)\}/gm,
    (_, colons, attrs) => {
      const classMatch = attrs.match(/\.([a-zA-Z0-9_-]+)/)
      const name = classMatch ? classMatch[1] : 'div'
      return `${colons}${name}{${attrs}}`
    }
  )
  return unified().use(remarkParse).use(remarkDirective).parse(preprocessed)
}

function run(rule, md) {
  const diagnostics = []
  rule(makeTree(md), md, diagnostics)
  return diagnostics
}

// ─── unknownBlockClass ───────────────────────────────────────────────────────

describe('unknownBlockClass()', () => {
  test('no diagnostic for known classes', () => {
    const md = `:::{.figure}
:::`
    expect(run(unknownBlockClass, md)).toHaveLength(0)
  })

  test('warning for unknown class', () => {
    const md = `:::{.foobar}
:::`
    const [d] = run(unknownBlockClass, md)
    expect(d.severity).toBe('warning')
    expect(d.code).toBe('unknown-block-class')
    expect(d.line).toBe(1)
  })

  test('no false positive for all known classes', () => {
    const knownClasses = [
      'ack',
      'argument',
      'credits',
      'dedication',
      'epigraph',
      'figure',
      'outline',
      'box',
      'prenote',
      'question',
      'answer',
      'quote-alt',
      'refs',
      'rich-quote',
      'sig',
      'sponsor',
      'translation',
    ]
    for (const cls of knownClasses) {
      const md = `:::{.${cls}}\n:::`
      expect(
        run(unknownBlockClass, md),
        `unexpected warning for .${cls}`
      ).toHaveLength(0)
    }
  })
})

// ─── singleEpigraphClass ─────────────────────────────────────────────────────

describe('singleEpigraphClass()', () => {
  test('no diagnostic for a single epigraph', () => {
    const md = `:::{.epigraph}
:::`
    expect(run(singleEpigraphClass, md)).toHaveLength(0)
  })

  test('no diagnostic when there is no epigraph', () => {
    const md = `:::{.figure}
:::`
    expect(run(singleEpigraphClass, md)).toHaveLength(0)
  })

  test('warning for a second epigraph', () => {
    const md = `:::{.epigraph}
:::

:::{.epigraph}
:::`
    const diagnostics = run(singleEpigraphClass, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].severity).toBe('warning')
    expect(diagnostics[0].code).toBe('single-epigraph-class')
    expect(diagnostics[0].line).toBe(4)
  })
})

// ─── questionAnswerTextOnly ──────────────────────────────────────────────────

describe('questionAnswerTextOnly()', () => {
  test('no diagnostic for text-only question', () => {
    const md = `:::{.question}
Quelle est la question ?
:::`
    expect(run(questionAnswerTextOnly, md)).toHaveLength(0)
  })

  test('no diagnostic for text-only answer', () => {
    const md = `:::{.answer}
Voici la réponse.
:::`
    expect(run(questionAnswerTextOnly, md)).toHaveLength(0)
  })

  test('error for a list inside a question', () => {
    const md = `:::{.question}
- un
- deux
:::`
    const [d] = run(questionAnswerTextOnly, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('qa-text-only')
    expect(d.message).toContain('liste')
  })

  test('error for a blockquote inside an answer', () => {
    const md = `:::{.answer}
> une citation
:::`
    const [d] = run(questionAnswerTextOnly, md)
    expect(d.code).toBe('qa-text-only')
    expect(d.message).toContain('citation')
  })

  test('no false positive outside question/answer', () => {
    const md = `:::{.box}
- un
- deux
:::`
    expect(run(questionAnswerTextOnly, md)).toHaveLength(0)
  })
})

// ─── unknownInlineClass ──────────────────────────────────────────────────────

describe('unknownInlineClass()', () => {
  test('no diagnostic for known inline class', () => {
    expect(run(unknownInlineClass, '[text]{.smallcaps}')).toHaveLength(0)
  })

  test('warning for unknown inline class', () => {
    const [d] = run(unknownInlineClass, '[text]{.foobar}')
    expect(d.severity).toBe('warning')
    expect(d.code).toBe('unknown-inline-class')
  })

  test('reports correct line number', () => {
    const md = `first line\n[text]{.unknown}`
    const [d] = run(unknownInlineClass, md)
    expect(d.line).toBe(2)
  })

  test('no false positive for all known inline classes', () => {
    const knownClasses = [
      'credits',
      'endnote',
      'footnote',
      'index-type',
      'inlinequote',
      'smallcaps',
      'head',
      'speaker',
      'name',
      'surname',
      'aut',
    ]
    for (const cls of knownClasses) {
      expect(
        run(unknownInlineClass, `[text]{.${cls}}`),
        `unexpected warning for .${cls}`
      ).toHaveLength(0)
    }
  })
})

// ─── figureMustContainImage ──────────────────────────────────────────────────

describe('figureMustContainImage()', () => {
  test('no diagnostic when figure contains an image', () => {
    const md = `:::{.figure}
![caption](image.png)
:::`
    expect(run(figureMustContainImage, md)).toHaveLength(0)
  })

  test('error when figure has no image', () => {
    const md = `:::{.figure}
just text
:::`
    const [d] = run(figureMustContainImage, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('figure-missing-image')
    expect(d.line).toBe(1)
  })
})

// ─── prenoteRequiresOrigin ───────────────────────────────────────────────────

describe('prenoteRequiresOrigin()', () => {
  test('no diagnostic when origin is present', () => {
    const md = `:::{.prenote origin="aut"}
:::`
    expect(run(prenoteRequiresOrigin, md)).toHaveLength(0)
  })

  test('error when origin is missing', () => {
    const md = `:::{.prenote}
:::`
    const [d] = run(prenoteRequiresOrigin, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('prenote-missing-origin')
  })
})

// ─── translationRequiresLang ─────────────────────────────────────────────────

describe('translationRequiresLang()', () => {
  test('no diagnostic when all translations have lang', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::
:::{.translation lang="en"}
:::
:::`
    expect(run(translationRequiresLang, md)).toHaveLength(0)
  })

  test('no diagnostic when there are no translations', () => {
    const md = `:::{.rich-quote}
> citation
:::`
    expect(run(translationRequiresLang, md)).toHaveLength(0)
  })

  test('error when a translation is missing lang', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::
:::{.translation}
:::
:::`
    const diagnostics = run(translationRequiresLang, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].severity).toBe('error')
    expect(diagnostics[0].code).toBe('translation-missing-lang')
    expect(diagnostics[0].line).toBe(4)
  })

  test('reports all translations missing lang', () => {
    const md = `:::{.rich-quote}
:::{.translation}
:::
:::{.translation}
:::
:::`
    const diagnostics = run(translationRequiresLang, md)
    expect(diagnostics).toHaveLength(2)
  })

  test('no error for translation outside rich-quote', () => {
    // translation outside rich-quote is handled by unknownBlockClass (it IS a known class)
    const md = `:::{.translation}
:::`
    expect(run(translationRequiresLang, md)).toHaveLength(0)
  })
})

// ─── translationNotNested ────────────────────────────────────────────────────

describe('translationNotNested()', () => {
  test('no diagnostic for valid structure', () => {
    const md = `:::{.rich-quote}
:::{.translation lang="fr"}
:::
:::`
    expect(run(translationNotNested, md)).toHaveLength(0)
  })

  test('error when translation is nested inside another translation', () => {
    const md = `:::{.translation lang="fr"}
:::{.translation lang="en"}
:::
:::`
    const [d] = run(translationNotNested, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('translation-nesting-invalid')
    expect(d.line).toBe(2)
  })
})

// ─── indexEntryRequiresIdref ─────────────────────────────────────────────────

describe('indexEntryRequiresIdref()', () => {
  test('no diagnostic when idref is present', () => {
    expect(
      run(indexEntryRequiresIdref, '[term]{.index-type idref="abc-123"}')
    ).toHaveLength(0)
  })

  test('warning when idref is missing', () => {
    const [d] = run(indexEntryRequiresIdref, '[term]{.index-type}')
    expect(d.severity).toBe('warning')
    expect(d.code).toBe('index-entry-missing-idref')
  })
})
