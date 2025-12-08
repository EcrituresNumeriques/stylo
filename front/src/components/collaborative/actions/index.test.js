import { describe, expect, test } from 'vitest'

import { blockAttributes, copyPasteUrlFn } from './index.js'

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

describe('copyPasteUrlFn()', () => {
  const cases = [
    { name: 'nothing/nothing', clipboardText: '', selectionText: '', result: [1, '[](https://example.com)'] },
    { name: 'text/nothing', clipboardText: 'clip', selectionText: '', result: [6, '[clip](https://example.com)'] },
    { name: 'nothing/text', clipboardText: '', selectionText: 'text', result: [6, '[text](https://example.com)'] },
    { name: 'text/text', clipboardText: 'clip', selectionText: 'text', result: [6, '[text](https://example.com)'] },
    { name: 'url/nothing', clipboardText: 'https://clipboard.local', selectionText: '', result: [1, '[](https://clipboard.local)'] },
    { name: 'nothing/url', clipboardText: '', selectionText: 'https://selection.local', result: [1, '[](https://selection.local)'] },
    { name: 'url/url', clipboardText: 'https://clipboard.local', selectionText: 'https://selection.local', result: [25, '[https://selection.local](https://clipboard.local)'] },
    { name: 'text/url', clipboardText: 'clip', selectionText: 'https://selection.local', result: [6, '[clip](https://selection.local)'] },
    { name: 'url/text', clipboardText: 'https://clipboard.local', selectionText: 'text', result: [6, '[text](https://clipboard.local)'] },
  ]

  test.each(cases)('$name', ({ clipboardText, selectionText, result }) => {
    expect(copyPasteUrlFn({ body_template: '[{{text}}]({{url}})', clipboardText, selectionText })).toEqual(result)
  })
})
