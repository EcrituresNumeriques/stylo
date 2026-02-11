import { describe, expect, test } from 'vitest'

import { filter, validate } from './bibtex'

describe('validate', () => {
  test('it should return line errors on syntax error', async () => {
    const text = `@book{noauthor_test19_nodate,
            title = {test19
        }

        @book{noauthor_test26_nodate,
            title = {test26}
        }`

    const result = await validate(text)
    expect(result.errors).toEqual([
      {
        expected: '}',
        found: '@',
        line: 5,
        type: 'token_mismatch',
      },
    ])
  })

  test('it should return an empty error array if syntax is correct', async () => {
    const text = `@book{noauthor_test19_nodate,
            title = {test19}
        }

        @book{noauthor_test26_nodate,
            title = {test26}
        }`

    const result = await validate(text)
    expect(result).toHaveProperty('errors', [])
    expect(Object.keys(result.entries).length).toEqual(2)
  })

  test('it should return an empty entries', async () => {
    const text = ` abcd `

    const result = await validate(text)
    expect(result).toHaveProperty('empty', false)
    expect(result).toHaveProperty('warnings', [])
    expect(result).toHaveProperty('errors', [])
  })

  test('it should be okay with an empty string', async () => {
    const text = ''

    const result = await validate(text)
    expect(result).toHaveProperty('empty', true)
    expect(result).toHaveProperty('warnings', [])
    expect(result).toHaveProperty('errors', [])
  })

  test('it should be okay with a trimmable value', async () => {
    const text = '   '

    const result = await validate(text)
    expect(result).toHaveProperty('empty', true)
    expect(result).toHaveProperty('warnings', [])
    expect(result).toHaveProperty('errors', [])
  })

  test('it should produce a warning', async () => {
    const text = `@book{noauthor_test26_nodate,
        title = {test26}
      }

      @foo {

      @book {noauthor_test24_nodate,
        title = {test24}
      }`
    const result = await validate(text)
    expect(Object.keys(result.entries).length).toEqual(1)
    expect(result.warnings).toEqual([
      {
        line: 7,
        type: 'unknown_type',
        type_name: 'foo',
      },
    ])
  })

  test('it should validate a given bibtex', async () => {
    const text = `@misc{dehut_en_2018,
      type = {Billet},
      title = {En finir avec {Word} ! {Pour} une analyse des enjeux relatifs aux traitements de texte et à leur utilisation},
      url = {https://eriac.hypotheses.org/80},
      abstract = {Le titre de ce billet aurait pu être formé autour d’une expression célèbre attribuée à Caton l’ancien : delenda carthago[1], il faut détruire Carthage. Citation dont on trouve notamment un écho chez Plutarque[2] qui relate...},
      language = {fr-FR},
      urldate = {2018-03-29},
      journal = {L’atelier des savoirs},
      author = {Dehut, Julien},
      month = jan,
      year = {2018},
      file = {Snapshot:/home/antoine/Zotero/storage/VC32TEFF/Dehut - En finir avec Word ! Pour une analyse des enjeux r.html:text/html}
    }`

    const result = await validate(text)
    expect(result.warnings).toEqual([])
    expect(result.errors).toEqual([])
  })

  test('it should remove empty citation from a raw bibtex', async () => {
    const text = `
@incollection{bonnet_rome_2013,
\taddress = {Paris},
\tseries = {Rencontres},
\ttitle = {Rome, les {Romains} et l’art grec : {\\textless}/i{\\textgreater}translatio, interpretatio, imitatio, aemulatio....{\\textless}/i{\\textgreater}},
\tisbn = {978-2-8124-1105-2},
\turl = {https://halshs.archives-ouvertes.fr/halshs-00938998},
\tlanguage = {fre},
\tnumber = {52},
\tbooktitle = {{\\textless}/i{\\textgreater}{Translatio}{\\textless}/i{\\textgreater} :  traduire et adapter les {Anciens}},
\tpublisher = {Classiques Garnier},
\tauthor = {Dardenay, Alexandra},
\teditor = {Bonnet, Corinne and Bouchet, Florence},
\tyear = {2013},
\tnote = {ill. 23 cm. Textes des contributions présentées lors du séminaire transversal du Laboratoire PLH, Patrimoine, littérature, histoire, EA 4601, de l'Université Toulouse II-Le Mirail, 2008-2010. Bibliogr. p. 305-317. Notes bibliogr. Index.},
\tkeywords = {Civilisation occidentale, Littérature antique}
}

@incollection{noauthor_notitle_nodate
}

@book{pollux_grammaticus_onomasticon_nodate,
\ttitle = {Onomasticon},
\tauthor = {Pollux grammaticus}
}`

    const resultBefore = await validate(text)
    expect(Object.keys(resultBefore.entries).length).toEqual(2)
    expect(resultBefore).toHaveProperty('warnings', [])
    expect(resultBefore).toHaveProperty('errors', [
      {
        entry: 'bonnet_rome_2013',
        key: 'noauthor_notitle_nodate',
        line: 20,
        type: 'missing_equal_sign',
      },
    ])

    const filteredText = filter(text)
    const resultAfter = await validate(filteredText)
    expect(Object.keys(resultAfter).length).toEqual(4)
    expect(resultAfter).toHaveProperty('warnings', [])
    expect(resultAfter).toHaveProperty('errors', [])
  })

  test('it should be valid when empty', async () => {
    expect(await validate('')).toEqual({
      empty: true,
      entries: {},
      errors: [],
      warnings: [],
    })
  })

  test('it should return errors with issues', async () => {
    expect(await validate('@[][][][][]')).toEqual({
      entries: {},
      empty: false,
      errors: [
        {
          line: 1,
          type: 'runaway_key',
        },
      ],
      warnings: [],
    })
    expect(await validate('abcd')).toEqual({
      empty: false,
      entries: {},
      errors: [],
      warnings: [],
    })
  })

  test('it should be valid', async () => {
    const bib = `@book{noauthor_test19_nodate,
      title = {test19}
    }`

    expect(await validate(bib)).toEqual({
      empty: false,
      entries: {
        1: {
          bib_type: 'book',
          entry_key: 'noauthor_test19_nodate',
          fields: {
            title: [
              {
                text: 'test19',
                type: 'text',
              },
            ],
          },
          raw_text: `@book{noauthor_test19_nodate,
 title = {test19}
 }`,
        },
      },
      errors: [],
      warnings: [],
    })
  })
})
