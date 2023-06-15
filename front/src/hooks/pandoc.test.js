import { usePandocAnchoring } from './pandoc.js'

describe('usePandocAnchoring()', () => {
  test('generate expected anchors', () => {
    const getAnchor = usePandocAnchoring()

    expect(getAnchor('# Test')).toEqual('test')
    expect(getAnchor('## Section Title')).toEqual('section-title')
    expect(getAnchor('## Héo')).toEqual('heo')
  })

  test('handle duplicate headings', () => {
    const getAnchor = usePandocAnchoring()

    expect(getAnchor('## Héo')).toEqual('heo')
    expect(getAnchor('## Héo')).toEqual('heo-1')

    expect(getAnchor('## Héo 1')).toEqual('heo-1-1')
    expect(getAnchor('## Héo 1')).toEqual('heo-1-2')
  })
})
