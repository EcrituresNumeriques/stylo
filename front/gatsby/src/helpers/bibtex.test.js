import {parse, validate, toBibtex} from './bibtex'
import bib2key from '../components/Write/bibliographe/CitationsFilter.js'

describe('parse', () => {
    test('it should return line errors on syntax error', () => {
        const text = `@book{noauthor_test19_nodate,
            title = {test19
        }
        
        @book{noauthor_test26_nodate,
            title = {test26}
        }`

        return validate(text).then(result => {
          expect(result.errors).toEqual(expect.arrayContaining(['token_mismatch at line 5']))
        })
    })

    test('it should return an empty error array if syntax is correct', () => {
        const text = `@book{noauthor_test19_nodate,
            title = {test19}
        }
        
        @book{noauthor_test26_nodate,
            title = {test26}
        }`

        return validate(text).then(result => {
            expect(result).toHaveProperty('errors', [])
            expect(result.success).toEqual(2)
        })
    })

    test('it should return an empty entries', () => {
      const text = ` abcd `

      return validate(text).then(result => {
        expect(result).toHaveProperty('empty', false)
        expect(result).toHaveProperty('success', 0)
        expect(result).toHaveProperty('warnings', [])
        expect(result).toHaveProperty('errors', [])
      })
    })

    test('it should be okay with an empty string', () => {
      const text = ''

      return validate(text).then(result => {
        expect(result).toHaveProperty('empty', true)
        expect(result).toHaveProperty('success', 0)
        expect(result).toHaveProperty('warnings', [])
        expect(result).toHaveProperty('errors', [])
      })
    })


    test('it should be okay with a trimmable value', () => {
      const text = '   '

      return validate(text).then(result => {
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
      return validate(text).then(result => {
        expect(result).toHaveProperty('success', 1)
        expect(result.warnings).toEqual(expect.arrayContaining(['unknown_type at line 7']))
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

    return validate(text).then(result => {
      expect(result.warnings).toEqual([])
      expect(result.errors).toEqual([])
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

    const entries = bib2key(text).map(({ entry }) => entry)

    expect(toBibtex(entries)).toMatch('journaltitle = {L’atelier des savoirs}')
    expect(toBibtex(entries)).toMatch('file = {Snapshot:/home/antoine/Zotero/storage/VC32TEFF/Dehut - En finir avec Word ! Pour une analyse des enjeux r.html:text/html}')
  })
})