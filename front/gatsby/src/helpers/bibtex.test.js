import {parse, validate} from './bibtex'

describe('parse', () => {
    test('it should return line errors on syntax error', () => {
        const tex = `@book{noauthor_test19_nodate,
            title = {test19
        }
        
        @book{noauthor_test26_nodate,
            title = {test26}
        }`

        return parse(tex).then(result => {
            expect(result).toHaveProperty(['errors', 0, 'type'], 'token_mismatch')
        })
    })

    test('it should return an empty error array if syntax is correct', () => {
        const tex = `@book{noauthor_test19_nodate,
            title = {test19}
        }
        
        @book{noauthor_test26_nodate,
            title = {test26}
        }`

        return parse(tex).then(result => {
            expect(result).toHaveProperty('errors', [])
            expect(result).toHaveProperty(['entries', '1', 'entry_key'], 'noauthor_test19_nodate')
        })
    })

    test('it should return an empty entries', () => {
      const tex = `abcd`

      return parse(tex).then(result => {
        expect(result).toHaveProperty('entries', {})
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
      return parse(text).then(result => {
        expect(result.entries).toMatchObject({1: {}})
        expect(result).toHaveProperty(['warnings', 0], {type: 'unknown_type', type_name: 'foo', line: 7})
    })
  })
  test('it should validate a bitext', () => {
    const text = `@book{noauthor_test26_nodate,
      title = {test26}
    }
    
    @foo {

    @book {noauthor_test24_nodate,
      title = {test24}
    }`
    return validate(text).then(result => {
      expect(result.warnings).toEqual(expect.arrayContaining(['unknown_type at line 7']))
      expect(result.errors).toEqual(expect.arrayContaining(['missing_equal_sign at line 7', 'token_mismatch at line 7']))
  })
})
})