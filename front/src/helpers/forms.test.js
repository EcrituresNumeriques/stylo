import { describe, test, expect } from 'vitest'
import { fromFormData } from './forms.js'

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
