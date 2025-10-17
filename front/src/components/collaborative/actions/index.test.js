import { blockAttributes } from './index.js'

import { describe, expect, test } from 'vitest'

describe('blockAttributes', () => {
  test('works with a single className', () => {
    expect(blockAttributes({ classNames: ['ack']})).toEqual('.ack')
  })

  test('works with a single attribute', () => {
    expect(blockAttributes({ attrs: {origine: 'valeur'}})).toEqual('origine="valeur"')
  })

  test('works with a combination of both', () => {
    expect(blockAttributes({
      classNames: ['ack', 'sponsor'],
      attrs: { origine: 'valeur', lang: 'fr'}
    })).toEqual('.ack .sponsor origine="valeur" lang="fr"')
  })
})
