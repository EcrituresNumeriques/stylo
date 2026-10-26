import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { describe, expect, test } from 'vitest'

import {
  bibliographyTitle,
  epigraphSingleQuote,
  figureContentRestricted,
  figureCreditsSpanOrDiv,
  figureCreditsSpanPlacement,
  figureMustContainImage,
  figureSingleCredits,
  headingHierarchy,
  indexEntryRequiresIdref,
  liminaryContentRestricted,
  prenoteRequiresOrigin,
  questionAnswerSpeaker,
  questionAnswerTextOnly,
  requiredMetadata,
  richQuoteContent,
  singleEpigraphClass,
  sponsorTextOnly,
  translationContent,
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

function run(rule, md, context) {
  const diagnostics = []
  rule(makeTree(md), md, diagnostics, context)
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
      'rich-quote',
      'sig',
      'sponsor',
      'translation',
      'linguistic',
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

describe('epigraphSingleQuote()', () => {
  test('no diagnostic for an epigraph with a single rich quote', () => {
    const md = `:::{.epigraph}
:::{.rich-quote}
> Une citation
[@source]

:::{.translation lang="en"}
> A quote
:::
:::
:::`
    expect(run(epigraphSingleQuote, md)).toHaveLength(0)
  })

  test('no diagnostic for a multi-paragraph block quote', () => {
    const md = `:::{.epigraph}
> Premier paragraphe
continuation paresseuse
>
> Second paragraphe
:::`
    expect(run(epigraphSingleQuote, md)).toHaveLength(0)
  })

  test('warning for a second rich quote', () => {
    const md = `:::{.epigraph}
:::{.rich-quote}
> Une citation
:::
:::{.rich-quote}
> Une autre citation
:::
:::`
    const diagnostics = run(epigraphSingleQuote, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].severity).toBe('warning')
    expect(diagnostics[0].code).toBe('epigraph-single-quote')
    expect(diagnostics[0].line).toBe(5)
  })

  test('warning for two block quotes separated by a blank line', () => {
    const md = `:::{.epigraph}
> Une citation

> Une autre citation
:::`
    const diagnostics = run(epigraphSingleQuote, md)
    expect(diagnostics.map((d) => d.line)).toEqual([4])
  })

  test('warning for a block quote next to a rich quote', () => {
    const md = `:::{.epigraph}
> Une citation

:::{.quote-alt}
Une autre citation
:::
:::`
    expect(run(epigraphSingleQuote, md).map((d) => d.line)).toEqual([4])
  })

  test('no false positive outside an epigraph', () => {
    const md = `> Une citation

> Une autre citation`
    expect(run(epigraphSingleQuote, md)).toHaveLength(0)
  })

  test('warning for an epigraph without quotation', () => {
    const md = `:::{.epigraph}
Un texte qui n'est pas une citation.
:::`
    const [d] = run(epigraphSingleQuote, md)
    expect(d.severity).toBe('warning')
    expect(d.code).toBe('epigraph-missing-quote')
    expect(d.messageKey).toBe('validation.rules.epigraphMissingQuote')
    expect(d.line).toBe(1)
  })
})

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
    expect(d.messageKey).toBe('validation.rules.questionAnswerTextOnly')
    expect(d.messageParams).toEqual({
      block: 'question',
      element: 'validation.rules.elements.list',
    })
  })

  test('error for a blockquote inside an answer', () => {
    const md = `:::{.answer}
> une citation
:::`
    const [d] = run(questionAnswerTextOnly, md)
    expect(d.code).toBe('qa-text-only')
    expect(d.messageParams.element).toBe('validation.rules.elements.blockquote')
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

describe('sponsorTextOnly()', () => {
  test('no diagnostic for text with typographic markup', () => {
    const md = `:::{.sponsor}
Avec le soutien de l'*Université de Montréal* et du [CRSH]{.smallcaps}.

Second paragraphe.
:::`
    expect(run(sponsorTextOnly, md)).toHaveLength(0)
  })

  test('error for a list inside a sponsor', () => {
    const md = `:::{.sponsor}
- un
- deux
:::`
    const [d] = run(sponsorTextOnly, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('sponsor-text-only')
    expect(d.messageKey).toBe('validation.rules.sponsorTextOnly')
    expect(d.messageParams).toEqual({
      element: 'validation.rules.elements.list',
    })
  })

  test('error for a nested block inside a sponsor', () => {
    const md = `:::{.sponsor}
:::{.box}
texte
:::
:::`
    const [d] = run(sponsorTextOnly, md)
    expect(d.messageParams.element).toBe('validation.rules.elements.nested')
  })

  test('no false positive outside a sponsor', () => {
    const md = `:::{.box}
> une citation
:::`
    expect(run(sponsorTextOnly, md)).toHaveLength(0)
  })
})

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
      'index-type',
      'inlinequote',
      'smallcaps',
      'head',
      'speaker',
      'name',
      'surname',
      'aut',
      'surtitle',
      'verse',
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

// ─── figureContentRestricted ─────────────────────────────────────────────────

describe('figureContentRestricted()', () => {
  test('no diagnostic for image + head + credits div', () => {
    const md = `:::{.figure}

[Carte de l'Europe après le congrès de Vienne]{.head}

![Carte de l'Europe en 1815](cartes/europe-1815.png)

:::{.credits}
© Bibliothèque nationale de France, département Cartes et plans
:::

:::`
    expect(run(figureContentRestricted, md)).toHaveLength(0)
  })

  test('no diagnostic for image + head + inline credits', () => {
    const md = `:::{.figure}

[Portrait de John Dewey]{.head}

![John Dewey vers 1902](portraits/dewey.jpg)

[Source : Eva Watson-Schütze, domaine public]{.credits}
:::`
    expect(run(figureContentRestricted, md)).toHaveLength(0)
  })

  test('no diagnostic for a credits span nested in a head span', () => {
    const md = `:::{.figure}
[L'image dans sa splendeur, telle qu'on peut l'admirer au [Musée du Louvre]{.credits}]{.head}

![Image mirobolante](mkdreference/medias/image.png)
:::`
    expect(run(figureContentRestricted, md)).toHaveLength(0)
  })

  test('no diagnostic for credits hijacked in the légende (alt)', () => {
    const md = `:::{.figure}
![Vue de la bibliothèque [© Gallica / BnF]{.credits}](photos/bibliotheque.jpg)
:::`
    expect(run(figureContentRestricted, md)).toHaveLength(0)
  })

  test('error for free text', () => {
    const md = `:::{.figure}
![Carte de l'Europe en 1815](cartes/europe-1815.png)
Cette carte illustre le redécoupage des frontières.
:::`
    const [d] = run(figureContentRestricted, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('figure-content-restricted')
    expect(d.line).toBe(3)
  })

  test('error for a disallowed nested block', () => {
    const md = `:::{.figure}
![Carte de l'Europe en 1815](cartes/europe-1815.png)
:::{.box}
Encadré explicatif
:::
:::`
    const [d] = run(figureContentRestricted, md)
    expect(d.code).toBe('figure-content-restricted')
    expect(d.messageKey).toBe('validation.rules.figureContentRestrictedBlock')
    expect(d.messageParams).toEqual({ class: 'box' })
    expect(d.line).toBe(3)
  })

  test('no false positive outside a figure', () => {
    const md = `:::{.box}
Un encadré peut contenir du texte libre.
:::`
    expect(run(figureContentRestricted, md)).toHaveLength(0)
  })
})

// ─── figureCreditsSpanOrDiv ──────────────────────────────────────────────────

describe('figureCreditsSpanOrDiv()', () => {
  test('no diagnostic for credits as div only', () => {
    const md = `:::{.figure}
![John Dewey vers 1902](portraits/dewey.jpg)
:::{.credits}
Source : Eva Watson-Schütze, domaine public
:::
:::`
    expect(run(figureCreditsSpanOrDiv, md)).toHaveLength(0)
  })

  test('no diagnostic for credits as span only', () => {
    const md = `:::{.figure}
![John Dewey vers 1902](portraits/dewey.jpg)
[Source : Eva Watson-Schütze, domaine public]{.credits}
:::`
    expect(run(figureCreditsSpanOrDiv, md)).toHaveLength(0)
  })

  test('error for credits as both span and div', () => {
    const md = `:::{.figure}
![John Dewey vers 1902](portraits/dewey.jpg)
[Source : Eva Watson-Schütze, domaine public]{.credits}
:::{.credits}
Source : Eva Watson-Schütze, domaine public
:::
:::`
    const [d] = run(figureCreditsSpanOrDiv, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('figure-credits-span-and-div')
    expect(d.line).toBe(3)
  })

  test('credits in the légende (alt) does not count as a span', () => {
    const md = `:::{.figure}
![Vue de la bibliothèque [© Gallica / BnF]{.credits}](photos/bibliotheque.jpg)
:::{.credits}
© Bibliothèque nationale de France
:::
:::`
    expect(run(figureCreditsSpanOrDiv, md)).toHaveLength(0)
  })
})

// ─── prenoteRequiresOrigin ───────────────────────────────────────────────────

describe('figureSingleCredits()', () => {
  test('no diagnostic for a single credits span in the head', () => {
    const md = `:::{.figure}
[Titre [© Musée du Louvre]{.credits}]{.head}
![légende](image.png)
:::`
    expect(run(figureSingleCredits, md)).toHaveLength(0)
  })

  test('no diagnostic for a single credits span in the légende (alt)', () => {
    const md = `:::{.figure}
![Vue [© Gallica / BnF]{.credits}](photos/bibliotheque.jpg)
:::`
    expect(run(figureSingleCredits, md)).toHaveLength(0)
  })

  test('no diagnostic for a span and a div, already reported', () => {
    const md = `:::{.figure}
![légende](image.png)
[© BnF]{.credits}
:::{.credits}
© BnF
:::
:::`
    expect(run(figureSingleCredits, md)).toHaveLength(0)
  })

  test('error for credits in both the head and the légende', () => {
    const md = `:::{.figure}
[Titre [© Louvre]{.credits}]{.head}
![Vue [© BnF]{.credits}](image.png)
:::`
    const diagnostics = run(figureSingleCredits, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].severity).toBe('error')
    expect(diagnostics[0].code).toBe('figure-single-credits')
    expect(diagnostics[0].line).toBe(3)
    expect(diagnostics[0].column).toBe(7)
  })

  test('error for credits in the légende and a credits div', () => {
    const md = `:::{.figure}
![Vue [© Gallica / BnF]{.credits}](image.png)
:::{.credits}
© Bibliothèque nationale de France
:::
:::`
    const diagnostics = run(figureSingleCredits, md)
    expect(diagnostics.map((d) => d.line)).toEqual([3])
  })

  test('error for two credits divs', () => {
    const md = `:::{.figure}
![légende](image.png)
:::{.credits}
© BnF
:::
:::{.credits}
© Louvre
:::
:::`
    expect(run(figureSingleCredits, md).map((d) => d.line)).toEqual([6])
  })
})

describe('figureCreditsSpanPlacement()', () => {
  test('no diagnostic for credits in the head or the légende', () => {
    const md = `:::{.figure}
[Titre [© Louvre]{.credits}]{.head}
![Vue [© BnF]{.credits}](image.png)
:::`
    expect(run(figureCreditsSpanPlacement, md)).toHaveLength(0)
  })

  test('error for a credits span directly in the figure', () => {
    const md = `:::{.figure}
![légende](image.png)
Source : [Eva Watson-Schütze]{.credits}
:::`
    const [d] = run(figureCreditsSpanPlacement, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('figure-credits-span-placement')
    expect(d.line).toBe(3)
    expect(d.column).toBe(10)
    expect(d.endColumn).toBe(40)
  })

  test('no false positive outside a figure', () => {
    const md = `[© BnF]{.credits}`
    expect(run(figureCreditsSpanPlacement, md)).toHaveLength(0)
  })
})

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

describe('liminaryContentRestricted()', () => {
  test('no diagnostic for text, lists, tables and quotations', () => {
    const md = `:::{.prenote origin="aut"}
Un *paragraphe*.

- un
- deux

> une citation

| a | b |
|---|---|
| 1 | 2 |
:::`
    expect(run(liminaryContentRestricted, md)).toHaveLength(0)
  })

  test('no diagnostic for figures and rich quotes', () => {
    const md = `:::{.argument}
:::{.figure}
![légende](image.png)
:::
:::{.rich-quote}
> citation
:::
:::{.quote-alt}
citation
:::
:::`
    expect(run(liminaryContentRestricted, md)).toHaveLength(0)
  })

  test('error for a dedication inside a prenote', () => {
    const md = `:::{.prenote origin="aut"}
:::{.dedication}
À ma mère.
:::
:::`
    const [d] = run(liminaryContentRestricted, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('liminary-content-restricted')
    expect(d.line).toBe(2)
    expect(d.messageParams).toEqual({ block: 'prenote', class: 'dedication' })
  })

  test('error for each disallowed class', () => {
    const md = `:::{.dedication}
:::{.epigraph}
:::
:::{.sponsor}
:::
:::`
    const diagnostics = run(liminaryContentRestricted, md)
    expect(diagnostics.map((d) => d.messageParams.class)).toEqual([
      'epigraph',
      'sponsor',
    ])
  })

  test('no false positive outside liminary blocks', () => {
    const md = `:::{.box}
:::{.dedication}
:::
:::`
    expect(run(liminaryContentRestricted, md)).toHaveLength(0)
  })
})

describe('translationRequiresLang()', () => {
  test('no diagnostic when all translations have lang without double quotes', () => {
    const md = `:::{.rich-quote}
:::{.translation lang=en}
> Tatitata in English.
>
> On two paragraphs.
:::

:::{.translation lang=no}
> Tatitata på norsk bokmål.
>
> På to avsnitt.
:::
:::`
    expect(run(translationRequiresLang, md)).toHaveLength(0)
  })
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

describe('richQuoteContent()', () => {
  test('no diagnostic for the editor template', () => {
    const md = `:::{.rich-quote lang="fr"}
> Le texte cité
> sur deux lignes
[@source]

:::{.translation lang="en"}
> The quoted text
[@source]
:::
:::`
    expect(run(richQuoteContent, md)).toHaveLength(0)
  })

  test('no diagnostic for a quote with lists, tables and paragraphs', () => {
    const md = `:::{.rich-quote}
> Premier paragraphe.
>
> - un
> - deux
>
> | a | b |
> |---|---|
> | 1 | 2 |

[voir @doe2020, p. 3; @smith]

[mot]{.index-type idref="1"} [@doe2020]
:::`
    expect(run(richQuoteContent, md)).toHaveLength(0)
  })

  test('error when the quoted text is missing', () => {
    const md = `:::{.rich-quote}
[@source]
:::`
    const [d] = run(richQuoteContent, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('rich-quote-missing-quote')
    expect(d.messageKey).toBe('validation.rules.richQuoteMissingQuote')
    expect(d.line).toBe(1)
  })

  test('error for free text next to the quoted text', () => {
    const md = `:::{.rich-quote}
> Le texte cité

Un commentaire.
:::`
    const [d] = run(richQuoteContent, md)
    expect(d.code).toBe('rich-quote-content-restricted')
    expect(d.line).toBe(4)
    expect(d.messageParams).toEqual({
      element: 'validation.rules.elements.text',
    })
  })

  test('no diagnostic for block quotes separated by a blank line', () => {
    const md = `:::{.rich-quote}
> Premier paragraphe cité

> Second paragraphe cité
:::`
    expect(run(richQuoteContent, md)).toHaveLength(0)
  })

  test('no diagnostic for references at the end of quoted paragraphs', () => {
    const md = `:::{.rich-quote}
> Premier paragraphe cité [@doe2020, p. 3].

> Second paragraphe cité @smith.
:::`
    expect(run(richQuoteContent, md)).toHaveLength(0)
  })

  test('error for a custom class other than translation', () => {
    const md = `:::{.rich-quote}
> Le texte cité

:::{.quote-alt}
citation
:::
:::`
    const [d] = run(richQuoteContent, md)
    expect(d.code).toBe('rich-quote-content-restricted')
    expect(d.messageKey).toBe(
      'validation.rules.richQuoteContentRestrictedBlock'
    )
    expect(d.messageParams).toEqual({ class: 'quote-alt' })
  })

  test('error for a heading or a nested quotation in the quoted text', () => {
    const md = `:::{.rich-quote}
> ## Un titre
>
> > Une citation imbriquée

> ## Un autre titre
:::`
    const diagnostics = run(richQuoteContent, md)
    expect(diagnostics.map((d) => [d.code, d.line])).toEqual([
      ['quoted-content-restricted', 2],
      ['quoted-content-restricted', 4],
      ['quoted-content-restricted', 6],
    ])
  })
})

describe('translationContent()', () => {
  test('no diagnostic for a quote and a reference', () => {
    const md = `:::{.rich-quote}
> Texte

:::{.translation lang="en"}
> Text
>
> On two paragraphs.

[@source]
:::
:::`
    expect(run(translationContent, md)).toHaveLength(0)
  })

  test('no diagnostic for translations of a linguistic quote', () => {
    const md = `:::{.linguistic}
Exemple

:::{.translation lang="en"}
Example
:::
:::`
    expect(run(translationContent, md)).toHaveLength(0)
  })

  test('error when the translated text is missing', () => {
    const md = `:::{.translation lang="en"}
Text
:::`
    const diagnostics = run(translationContent, md)
    expect(diagnostics.map((d) => d.code)).toEqual([
      'translation-content-restricted',
      'translation-missing-quote',
    ])
  })

  test('error for an index entry outside the quote', () => {
    const md = `:::{.translation lang="en"}
> Text

[word]{.index-type idref="1"}
:::`
    const [d] = run(translationContent, md)
    expect(d.code).toBe('translation-content-restricted')
    expect(d.line).toBe(4)
  })

  test('error for a child block, except a nested translation', () => {
    const md = `:::{.translation lang="en"}
> Text

:::{.translation lang="de"}
> Text
:::
:::{.box}
:::
:::`
    const diagnostics = run(translationContent, md)
    expect(diagnostics.map((d) => [d.code, d.line])).toEqual([
      ['translation-content-restricted', 7],
    ])
  })
})

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

// ─── headingHierarchy ────────────────────────────────────────────────────────

describe('questionAnswerSpeaker()', () => {
  test('no diagnostic when the speaker opens the block', () => {
    const md = `:::{.question}
[Marie Dupont]{.speaker} Quelle est la question ?
:::

:::{.answer}

[Jean Martin]{.speaker}
Voici la réponse.
:::`
    expect(run(questionAnswerSpeaker, md)).toHaveLength(0)
  })

  test('error when a question has no speaker', () => {
    const md = `:::{.question}
Quelle est la question ?
:::`
    const [d] = run(questionAnswerSpeaker, md)
    expect(d.severity).toBe('error')
    expect(d.code).toBe('qa-speaker-missing')
    expect(d.line).toBe(1)
    expect(d.messageParams).toEqual({ block: 'question' })
  })

  test('error when an answer has no speaker', () => {
    const md = `:::{.answer}
Voici la réponse.
:::`
    const [d] = run(questionAnswerSpeaker, md)
    expect(d.code).toBe('qa-speaker-missing')
    expect(d.messageParams).toEqual({ block: 'answer' })
  })

  test('error when the speaker comes after the text', () => {
    const md = `:::{.question}
Quelle est la question ?
[Marie Dupont]{.speaker}
:::`
    const [d] = run(questionAnswerSpeaker, md)
    expect(d.code).toBe('qa-speaker-not-first')
    expect(d.line).toBe(3)
  })

  test('error when the speaker is not at the start of the line', () => {
    const md = `:::{.question}
Quelle est la question ? [Marie Dupont]{.speaker}
:::`
    const [d] = run(questionAnswerSpeaker, md)
    expect(d.code).toBe('qa-speaker-not-first')
    expect(d.column).toBe(26)
  })

  test('no false positive outside question/answer', () => {
    const md = `:::{.box}
Du texte.
:::`
    expect(run(questionAnswerSpeaker, md)).toHaveLength(0)
  })
})

describe('headingHierarchy()', () => {
  test('no diagnostic for a consistent hierarchy', () => {
    const md = `## Introduction

### Contexte

#### Détail

### Méthode

## Conclusion`
    expect(run(headingHierarchy, md)).toHaveLength(0)
  })

  test('no diagnostic without headings', () => {
    expect(run(headingHierarchy, 'Du texte.')).toHaveLength(0)
  })

  test('error for a level 1 heading', () => {
    const md = `# Titre

## Section`
    const diagnostics = run(headingHierarchy, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].severity).toBe('error')
    expect(diagnostics[0].code).toBe('heading-level-1')
    expect(diagnostics[0].line).toBe(1)
  })

  test('error for a setext level 1 heading', () => {
    const md = `Titre
=====`
    const [d] = run(headingHierarchy, md)
    expect(d.code).toBe('heading-level-1')
  })

  test('error when the first heading is not level 2', () => {
    const md = `### Section

#### Sous-section`
    const diagnostics = run(headingHierarchy, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].code).toBe('heading-first-level')
    expect(diagnostics[0].messageParams).toEqual({ level: 3 })
  })

  test('error when a level is skipped', () => {
    const md = `## Section

#### Sous-sous-section

##### Détail`
    const diagnostics = run(headingHierarchy, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].code).toBe('heading-level-skipped')
    expect(diagnostics[0].line).toBe(3)
    expect(diagnostics[0].messageParams).toEqual({ level: 4, previous: 2 })
  })

  test('going back up several levels is allowed', () => {
    const md = `## A

### B

#### C

## D`
    expect(run(headingHierarchy, md)).toHaveLength(0)
  })
})

// ─── requiredMetadata ────────────────────────────────────────────────────────

describe('bibliographyTitle()', () => {
  test('info when the document ends with a heading', () => {
    const md = `## Introduction

Du texte.

## Bibliographie
`
    const diagnostics = run(bibliographyTitle, md)
    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].severity).toBe('info')
    expect(diagnostics[0].code).toBe('bibliography-title')
    expect(diagnostics[0].line).toBe(5)
  })

  test('no diagnostic when the document ends with text', () => {
    const md = `## Introduction

Du texte.`
    expect(run(bibliographyTitle, md)).toHaveLength(0)
  })

  test('no diagnostic for a heading inside a block at the end', () => {
    const md = `:::{.box}
## Titre de l'encadré
:::`
    expect(run(bibliographyTitle, md)).toHaveLength(0)
  })

  test('no diagnostic for an empty document', () => {
    expect(run(bibliographyTitle, '')).toHaveLength(0)
  })
})

describe('requiredMetadata()', () => {
  const metadata = {
    title: 'Un titre',
    authors: [{ forename: 'Marcello', surname: 'Vitali-Rosati' }],
    publicationDate: '2026-10-09',
    lang: 'fr',
  }

  test('no diagnostic when required metadata are set', () => {
    expect(run(requiredMetadata, '', { metadata })).toHaveLength(0)
  })

  test('warnings when metadata are missing', () => {
    const diagnostics = run(requiredMetadata, '', {})
    expect(diagnostics.map((d) => d.messageKey)).toEqual([
      'validation.rules.metadataMissingTitle',
      'validation.rules.metadataMissingAuthor',
      'validation.rules.metadataMissingPublicationDate',
      'validation.rules.metadataMissingLang',
    ])
    for (const d of diagnostics) {
      expect(d.severity).toBe('warning')
      expect(d.code).toBe('metadata-missing')
      expect(d.target).toBe('metadata')
      expect(d.line).toBeUndefined()
    }
  })

  test('warning when the title is blank', () => {
    const [d] = run(requiredMetadata, '', {
      metadata: { ...metadata, title: '  ' },
    })
    expect(d.field).toBe('title')
  })

  test('warning for each author without a surname', () => {
    const diagnostics = run(requiredMetadata, '', {
      metadata: {
        ...metadata,
        authors: [
          { forename: 'Marcello', surname: 'Vitali-Rosati' },
          { forename: 'Servanne' },
          { surname: '' },
        ],
      },
    })
    expect(diagnostics).toHaveLength(2)
    expect(diagnostics[0].messageKey).toBe(
      'validation.rules.metadataMissingAuthorSurname'
    )
    expect(diagnostics.map((d) => d.messageParams)).toEqual([
      { position: 2 },
      { position: 3 },
    ])
  })

  test('warning when the authors list is empty', () => {
    const [d] = run(requiredMetadata, '', {
      metadata: { ...metadata, authors: [] },
    })
    expect(d.messageKey).toBe('validation.rules.metadataMissingAuthor')
  })
})
