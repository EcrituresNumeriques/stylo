import { filter, toBibtex, toEntries, validate } from './bibtex'

describe('parse', () => {
  test('it should return line errors on syntax error', () => {
    const text = `@book{noauthor_test19_nodate,
            title = {test19
        }

        @book{noauthor_test26_nodate,
            title = {test26}
        }`

    return validate(text).then((result) => {
      expect(result.errors).toEqual(
        expect.arrayContaining(['token_mismatch at line 5'])
      )
    })
  })

  test('it should return an empty error array if syntax is correct', () => {
    const text = `@book{noauthor_test19_nodate,
            title = {test19}
        }

        @book{noauthor_test26_nodate,
            title = {test26}
        }`

    return validate(text).then((result) => {
      expect(result).toHaveProperty('errors', [])
      expect(result.success).toEqual(2)
    })
  })

  test('it should return an empty entries', () => {
    const text = ` abcd `

    return validate(text).then((result) => {
      expect(result).toHaveProperty('empty', false)
      expect(result).toHaveProperty('success', 0)
      expect(result).toHaveProperty('warnings', [])
      expect(result).toHaveProperty('errors', [])
    })
  })

  test('it should be okay with an empty string', () => {
    const text = ''

    return validate(text).then((result) => {
      expect(result).toHaveProperty('empty', true)
      expect(result).toHaveProperty('success', 0)
      expect(result).toHaveProperty('warnings', [])
      expect(result).toHaveProperty('errors', [])
    })
  })

  test('it should be okay with a trimmable value', () => {
    const text = '   '

    return validate(text).then((result) => {
      expect(result).toHaveProperty('empty', true)
      expect(result).toHaveProperty('success', 0)
      expect(result).toHaveProperty('warnings', [])
      expect(result).toHaveProperty('errors', [])
    })
  })

  test('it should produce a warning', () => {
    const text = `@book{noauthor_test26_nodate,
        title = {test26}
      }

      @foo {

      @book {noauthor_test24_nodate,
        title = {test24}
      }`
    return validate(text).then((result) => {
      expect(result).toHaveProperty('success', 1)
      expect(result.warnings).toEqual(
        expect.arrayContaining(['unknown_type at line 7'])
      )
    })
  })
  test('it should validate a given bibtex', () => {
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

    return validate(text).then((result) => {
      expect(result.warnings).toEqual([])
      expect(result.errors).toEqual([])
    })
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

    const entries = toEntries(text).map(({ entry }) => entry)

    expect(toBibtex(entries)).toMatch('journaltitle = {L’atelier des savoirs}')
    expect(toBibtex(entries)).toMatch(
      'file = {Snapshot:/home/antoine/Zotero/storage/VC32TEFF/Dehut - En finir avec Word ! Pour une analyse des enjeux r.html:text/html}'
    )
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
    expect(resultBefore).toHaveProperty('success', 2)
    expect(resultBefore).toHaveProperty('warnings', [])
    expect(resultBefore).toHaveProperty('errors', [
      'missing_equal_sign at line 20',
    ])

    const filteredText = filter(text)

    const resultAfter = await validate(filteredText)
    expect(resultAfter).toHaveProperty('success', 2)
    expect(resultAfter).toHaveProperty('warnings', [])
    expect(resultAfter).toHaveProperty('errors', [])

    const entries = toEntries(filteredText).map(({ entry }) => entry)
    expect(entries).toHaveLength(2)
    expect(entries[0].entry_key).toEqual('bonnet_rome_2013')
    expect(entries[1].entry_key).toEqual(
      'pollux_grammaticus_onomasticon_nodate'
    )
  })
})

describe('toEntries', () => {
  test('it should parse two item titles', () => {
    const text = `@book{noauthor_test19_nodate,
            title = {test19}
        }

        @book{noauthor_test26_nodate,
            title = {test26}
        }`

    return expect(toEntries(text)).toMatchObject([
      {
        title: 'test19',
        key: 'noauthor_test19_nodate',
        type: 'book',
        entry: {},
        date: undefined,
        authorName: ''
      },
      {
        title: 'test26',
        key: 'noauthor_test26_nodate',
        type: 'book',
        entry: {},
        date: undefined,
        authorName: ''
      },
    ])
  })

  test('it should derive an authorName', () => {
    const text = `@book{gelzer_eikones_1980,
	    title = {Eikones: {Studien} zum griechischen und römischen {Bildnis} : {Hans} {Jucker} zum sechzigsten {Geburtstag} {Gewidmet}},
      author = {Gelzer, Thomas},
    }`

    return expect(toEntries(text)).toMatchObject([
      {
        title:
          'Eikones: Studien zum griechischen und römischen Bildnis : Hans Jucker zum sechzigsten Geburtstag Gewidmet',
        key: 'gelzer_eikones_1980',
        type: 'book',
        entry: {},
        date: undefined,
        authorName: 'Thomas, Gelzer'
      },
    ])
  })

  test('it should parse a complex title', () => {
    const text = `@book{dominik_org_2010,
        title = {The {Org} {Mode} 7 {Reference} {Manual} - {Organize} your life with {GNU} {Emacs}}
      }`

    return expect(toEntries(text)).toMatchObject([
      {
        title:
          'The Org Mode 7 Reference Manual - Organize your life with GNU Emacs',
        key: 'dominik_org_2010',
        type: 'book',
        entry: {},
        date: undefined,
        authorName: ''
      },
    ])
  })
})
