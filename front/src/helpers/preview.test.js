import { describe, test, expect } from 'vitest'
import { compileTemplate } from './preview.js'

describe('compileTemplate', () => {
  const html = `<title>$supertitle$</title><main>
  <h1>$title$</h1>
  <p>$author$</p>
  <p>$author$</p>
  <p>$au
  thor$</p>
  <footer>$colophon</footer>yes$
</main>`

  test('empty template', () => {
    const template = compileTemplate()
    expect(template({ body: 'Coucou' })).toEqual('Coucou')
    expect(template({ body: '<h1>Coucou</h1>' })).toEqual('<h1>Coucou</h1>')
  })

  test('replace existing and missing values', () => {
    const template = compileTemplate(html)
    expect(template({ title: 'Coucou' })).toMatch(/<h1>Coucou<\/h1>/)
    expect(template({ author: 'Moi' })).toMatch(/<p>Moi<\/p>\n\s+<p>Moi<\/p>/)
    expect(template({ title: 'Coucou' })).toMatch(/<title><\/title>/)
  })

  test('ignore non-matching patterns', () => {
    const template = compileTemplate(html)
    expect(template({ author: 'Moi' })).toMatch(/<p>\$au\n\s+thor\$<\/p>/)
    expect(template({ author: 'Moi' })).toMatch(
      /<footer>\$colophon<\/footer>yes\$/
    )
  })
})
