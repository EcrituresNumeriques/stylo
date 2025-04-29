import { describe, expect, test } from 'vitest'
import { computeTextStats } from './markdown.js'

describe('computeTextStats()', () => {
  test('with empty text', () => {
    const stats = computeTextStats('')
    expect(stats.wordCount).toEqual(0)
    expect(stats.charCountNoSpace).toEqual(0)
    expect(stats.charCountPlusSpace).toEqual(0)
    expect(stats.citationNb).toEqual(0)
  })
})
