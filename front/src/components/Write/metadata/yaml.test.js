import { describe, expect, test } from 'vitest'

import { toYaml } from './yaml.js'

describe('YAML', () => {
  test('it should convert an empty object', () => {
    const result = toYaml({})

    expect(result).toEqual('')
  })
  test('it should convert an empty string', () => {
    const result = toYaml('')

    expect(result).toEqual('')
  })
  test('it should convert null', () => {
    const result = toYaml(null)

    expect(result).toEqual('')
  })
  test('it should convert undefined', () => {
    const result = toYaml(undefined)

    expect(result).toEqual('')
  })
  test('it should remove empty properties', () => {
    const result = toYaml({
      title: null,
      description: undefined,
      abstract: '',
      authors: [],
      version: '1.0.0',
    })

    expect(result).toEqual(`---
version: 1.0.0
---`)
  })
})
