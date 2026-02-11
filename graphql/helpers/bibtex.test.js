const { toEntries } = require('./bibtex.js')

const { describe, test } = require('node:test')
const assert = require('node:assert')

describe('toEntries', () => {
  test('it should create entries', async () => {
    const text = `@misc{dehut_en_2018,
      type = {Billet},
      title = {En finir avec {Word} ! {Pour} une analyse des enjeux relatifs aux traitements de texte et à leur utilisation},
      url = {https://eriac.hypotheses.org/80},
      abstract = {Le titre de ce billet aurait pu être formé autour d’une expression célèbre attribuée à Caton l’ancien : delenda carthago[1], il faut détruire Carthage. Citation dont on trouve notamment un écho chez Plutarque[2] qui relate...},
      language = {fr-FR},
      urldate = {2018-03-29},
      journal = {L’atelier des savoirs},
      journaltitle = {L’atelier des savoirs},
      author = {Dehut, Julien},
      month = jan,
      year = {2018},
      file = {Snapshot:/home/antoine/Zotero/storage/VC32TEFF/Dehut - En finir avec Word ! Pour une analyse des enjeux r.html:text/html}
    }`

    const entries = toEntries(text).map(({ entry }) => entry)
    assert.match(entries[0].raw_text, /journal = \{L’atelier des savoirs}/)
    assert.match(entries[0].raw_text, /journaltitle = \{L’atelier des savoirs}/)
    assert.match(
      entries[0].raw_text,
      /file = \{Snapshot:\/home\/antoine\/Zotero\/storage\/VC32TEFF\/Dehut - En finir avec Word ! Pour une analyse des enjeux r.html:text\/html}/
    )
  })

  test('it should parse two item titles', () => {
    const text = `@book{noauthor_test19_nodate,
            title = {test19}
        }

        @book{noauthor_test26_nodate,
            title = {test26}
        }`

    assert.deepEqual(
      toEntries(text).map((e) => {
        // eslint-disable-next-line no-unused-vars
        const { entry, ...rest } = e
        return rest
      }),
      [
        {
          title: 'test19',
          key: 'noauthor_test19_nodate',
          type: 'book',
          date: undefined,
          authorName: '',
        },
        {
          title: 'test26',
          key: 'noauthor_test26_nodate',
          type: 'book',
          date: undefined,
          authorName: '',
        },
      ]
    )
  })

  test('it should derive an authorName', () => {
    const text = `@book{gelzer_eikones_1980,
	    title = {Eikones: {Studien} zum griechischen und römischen {Bildnis} : {Hans} {Jucker} zum sechzigsten {Geburtstag} {Gewidmet}},
      author = {Gelzer, Thomas},
    }`

    assert.deepEqual(
      toEntries(text).map((e) => {
        // eslint-disable-next-line no-unused-vars
        const { entry, ...rest } = e
        return rest
      }),
      [
        {
          title:
            'Eikones: Studien zum griechischen und römischen Bildnis : Hans Jucker zum sechzigsten Geburtstag Gewidmet',
          key: 'gelzer_eikones_1980',
          type: 'book',
          date: undefined,
          authorName: 'Thomas, Gelzer',
        },
      ]
    )
  })

  test('it should parse a complex title', () => {
    const text = `@book{dominik_org_2010,
        title = {The {Org} {Mode} 7 {Reference} {Manual} - {Organize} your life with {GNU} {Emacs}}
      }`

    assert.deepEqual(
      toEntries(text).map((e) => {
        // eslint-disable-next-line no-unused-vars
        const { entry, ...rest } = e
        return rest
      }),
      [
        {
          title:
            'The Org Mode 7 Reference Manual - Organize your life with GNU Emacs',
          key: 'dominik_org_2010',
          type: 'book',
          date: undefined,
          authorName: '',
        },
      ]
    )
  })
})
