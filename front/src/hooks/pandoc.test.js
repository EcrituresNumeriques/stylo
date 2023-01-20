import { usePandocAnchoring, slugify } from './pandoc.js'

describe('slugify', () => {
  test('should match pandoc anchoring', () => {
    // echo '# Coucou, comment ça va ?' | pandoc -f markdown -t html
    expect(slugify('Coucou, comment ça va ?')).toEqual('coucou-comment-ça-va')
    // echo '# [SHARED] How To Stylo?' | pandoc -f markdown -t html
    expect(slugify('[SHARED] How To Stylo?')).toEqual('shared-how-to-stylo')
  })

  test('should match legacy export expectations', () => {
    // echo '# Coucou, comment ça va ?' | pandoc -f markdown -t html
    expect(slugify('Coucou, comment ça va ?', { diacritics: false })).toEqual('coucou-comment-ca-va')
  })
})

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
