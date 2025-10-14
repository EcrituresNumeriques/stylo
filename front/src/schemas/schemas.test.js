import { describe, expect, test } from 'vitest'

import { ArticleSchemas } from './schemas.js'

describe('schemas', () => {
  test('it has const metadata properties', () => {
    const schema = ArticleSchemas.find((s) => s.name === 'default')
    expect(schema.const).to.deep.equal({
      type: 'article',
      '@version': '1.0',
    })
  })
})
