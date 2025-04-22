const { deriveToc } = require('./markdown.js')

describe('deriveToc', () => {
  const emptyText = ''
  const textWithOneHeadline = `
# Hello World
This is not a # headline
#This one too (because there is no space in between)`
  const textWithManyHeadlines = `
# Hello World
This is not a # headline
## How are you?
Well, and you?
### Level 3
Not 2, not 4, but 3.`
  test('computeMajorVersion', () => {
    expect(deriveToc(emptyText)).toEqual('')
    expect(deriveToc(textWithOneHeadline)).toEqual('# Hello World')
    expect(deriveToc(textWithManyHeadlines)).toEqual(
      '# Hello World\n## How are you?\n### Level 3'
    )
  })
})
