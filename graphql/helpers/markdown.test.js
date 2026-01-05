const { deriveToc } = require('./markdown.js')

const { describe, test } = require('node:test')
const assert = require('node:assert')

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
    assert.equal(deriveToc(emptyText), '')
    assert.equal(deriveToc(textWithOneHeadline), '# Hello World')
    assert.equal(
      deriveToc(textWithManyHeadlines),
      '# Hello World\n## How are you?\n### Level 3'
    )
  })
})
