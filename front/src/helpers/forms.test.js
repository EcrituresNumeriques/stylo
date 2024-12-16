import { describe, test, expect } from 'vitest'
import { fromFormData, validateSameFieldValue } from './forms.js'

describe('fromFormData()', () => {
  test('with simple values', () => {
    const d = new FormData()
    d.append('un', 1)
    d.append('deux', 'deux')
    expect(fromFormData(d)).toEqual({ un: '1', deux: 'deux' })
  })

  test('with checkboxes values', () => {
    const d = new FormData()
    d.append('un', 'un')
    d.append('un', 'deux')
    d.append('tags[]', 'un')
    d.append('tags[]', 'deux')
    expect(fromFormData(d)).toEqual({ un: 'un', tags: ['un', 'deux'] })
  })
})

describe('validateSameFieldValue()', () => {
  function createPassword(name) {
    const el = document.createElement('input')
    el.type = 'password'
    el.name = name
    el.required = true
    return {
      get current() {
        return el
      },
    }
  }

  test('built-in validation is triggered when no value', () => {
    const [fieldA, fieldB] = [createPassword('a'), createPassword('b')]

    validateSameFieldValue(fieldA, fieldB, 'mismatch!')()
    expect(fieldA.current.validity.valid).toBe(false)
    expect(fieldA.current.validationMessage).toBe('Constraints not satisfied')
    expect(fieldA.current.validity.valueMissing).toBe(true)
  })

  test('works with same values', () => {
    const [fieldA, fieldB] = [createPassword('a'), createPassword('b')]
    fieldA.current.value = '@'
    fieldB.current.value = '@'

    validateSameFieldValue(fieldA, fieldB, 'mismatch!')()
    expect(fieldA.current.validity.valid).toBe(true)
    expect(fieldA.current.validationMessage).toBe('')
    expect(fieldA.current.validity.valueMissing).toBe(false)
  })

  test('fails when reference field is not set', () => {
    const [fieldA, fieldB] = [createPassword('a'), createPassword('b')]
    fieldA.current.value = ''
    fieldB.current.value = '@'

    validateSameFieldValue(fieldA, fieldB, 'mismatch!')()
    expect(fieldA.current.validity.valid).toBe(false)
    expect(fieldA.current.validationMessage).toBe('mismatch!')
    expect(fieldA.current.validity.valueMissing).toBe(true)
  })

  test('fails when reference field is set but does not validate', () => {
    const [fieldA, fieldB] = [createPassword('a'), createPassword('b')]
    fieldA.current.value = '@'
    fieldB.current.value = ''

    validateSameFieldValue(fieldA, fieldB, 'mismatch!')()
    expect(fieldA.current.validity.valid).toBe(false)
    expect(fieldA.current.validationMessage).toBe('mismatch!')
    expect(fieldA.current.validity.valueMissing).toBe(false)
  })

  test('fails when field value mismatches reference field', () => {
    const [fieldA, fieldB] = [createPassword('a'), createPassword('b')]
    fieldA.current.value = '@@'
    fieldB.current.value = '@'

    validateSameFieldValue(fieldA, fieldB, 'mismatch!')()
    expect(fieldA.current.validity.valid).toBe(false)
    expect(fieldA.current.validationMessage).toBe('mismatch!')
    expect(fieldA.current.validity.valueMissing).toBe(false)
  })
})
