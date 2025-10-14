import { describe, expect, test } from 'vitest'

import { ArticleSchemas, clean } from './schemas.js'

describe('schemas', () => {
  test('it has const metadata properties', () => {
    const schema = ArticleSchemas.find((s) => s.name === 'default')
    expect(schema.const).to.deep.equal({
      type: 'article',
      '@version': '1.0',
    })
  })
  test('it should remove empty array', () => {
    const data = {
      keywords: [],
      type: 'article',
      '@version': '1.0',
      localizedContent: [],
      controlledKeywords: [],
      authors: [],
      reviewers: [],
      transcribers: [],
      translators: [],
      issueDirectors: [],
      production: {
        entities: [],
      },
      journalDirectors: [],
      senspublic: {
        categories: [],
      },
    }
    expect(clean(data)).to.deep.equal({
      type: 'article',
      '@version': '1.0',
    })
  })
})
