import { describe, expect, test } from 'vitest'

import { computeTextStats, computeTextStructure } from './markdown.js'

describe('computeTextStats()', () => {
  test('with empty text', () => {
    const stats = computeTextStats('')
    expect(stats.wordCount).toEqual(0)
    expect(stats.charCountNoSpace).toEqual(0)
    expect(stats.charCountPlusSpace).toEqual(0)
    expect(stats.citationNb).toEqual(0)
  })
})

describe('computeTextStructure()', () => {
  test('with empty text', () => {
    const structure = computeTextStructure('')
    expect(structure).toEqual([])
  })
  test('with section titles', () => {
    const structure = computeTextStructure(`# Document Title

## Section Title 1

This is a paragraph.

### Section Title 2

This is another paragraph.

#### Section Title 3

This is yet another paragraph.

#### Section Title 3.1

## Section Title 1.1`)
    expect(structure).toStrictEqual([
      {
        index: 2,
        level: 1,
        line: '## Section Title 1',
        title: 'Section Title 1',
      },
      {
        index: 6,
        level: 2,
        line: '### Section Title 2',
        title: 'Section Title 2',
      },
      {
        index: 10,
        level: 3,
        line: '#### Section Title 3',
        title: 'Section Title 3',
      },
      {
        index: 14,
        level: 3,
        line: '#### Section Title 3.1',
        title: 'Section Title 3.1',
      },
      {
        index: 16,
        level: 1,
        line: '## Section Title 1.1',
        title: 'Section Title 1.1',
      },
    ])
  })
})
