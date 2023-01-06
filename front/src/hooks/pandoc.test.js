import { usePandocAnchoring } from './pandoc.js'

describe('usePandocAnchoring()', () => {
  test('generate expected anchors', () => {
    const getAnchor = usePandocAnchoring()

    expect(getAnchor('# Test')).toEqual('test')
    expect(getAnchor('## Section Title')).toEqual('section-title')
    expect(getAnchor('## Héo')).toEqual('héo')
  })

  test('handle duplicate headings', () => {
    const getAnchor = usePandocAnchoring()

    expect(getAnchor('## Héo')).toEqual('héo')
    expect(getAnchor('## Héo')).toEqual('héo-1')

    expect(getAnchor('## Héo 1')).toEqual('héo-1-1')
    expect(getAnchor('## Héo 1')).toEqual('héo-1-2')
  })
})
