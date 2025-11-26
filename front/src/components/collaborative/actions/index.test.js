import { describe, expect, test } from 'vitest'

import { blockAttributes } from './index.js'

describe('blockAttributes', () => {
  test('works with a single className', () => {
    expect(blockAttributes({ classNames: ['ack'] })).toEqual('{.ack}')
  })

  test('works with a single attribute', () => {
    expect(blockAttributes({ attrs: { origine: 'valeur' } })).toEqual(
      '{origine="valeur"}'
    )
  })

  test('works with a combination of both', () => {
    expect(
      blockAttributes({
        classNames: ['ack', 'sponsor'],
        attrs: { origine: 'valeur', lang: 'fr' },
      })
    ).toEqual('{.ack .sponsor origine="valeur" lang="fr"}')
  })

  test('returns nothing if attrs empty', () => {
    expect(
      blockAttributes({
        classNames: ['ack', 'sponsor'],
        attrs: null,
      })
    ).toEqual('')
  })
})
