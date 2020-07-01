import {parse, validate} from './bibtex'

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