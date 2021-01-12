import getEntries from './CitationsFilter.js'

describe('CitationFilter', () => {
  test('it should parse two item titles', () => {
    const text = `@book{noauthor_test19_nodate,
            title = {test19}
        }

        @book{noauthor_test26_nodate,
            title = {test26}
        }`

    return expect(getEntries(text)).toMatchObject([
      {
        title: 'test19',
        key: 'noauthor_test19_nodate',
        type: 'book',
        entry: {},
      },
      {
        title: 'test26',
        key: 'noauthor_test26_nodate',
        type: 'book',
        entry: {},
      },
    ])
  })

  test('it should parse a complex title', () => {
    const text = `@book{dominik_org_2010,
        title = {The {Org} {Mode} 7 {Reference} {Manual} - {Organize} your life with {GNU} {Emacs}}
      }`

    return expect(getEntries(text)).toMatchObject([
      {
        title:
          'The Org Mode 7 Reference Manual - Organize your life with GNU Emacs',
        key: 'dominik_org_2010',
        type: 'book',
        entry: {},
      },
    ])
  })
})
