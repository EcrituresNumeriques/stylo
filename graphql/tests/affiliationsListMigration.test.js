const { describe, test } = require('node:test')
const assert = require('node:assert')
const {
  normalizeAffiliations,
} = require('../migrations/20261121110000-affiliations-list.js')

describe('affiliations list migration', () => {
  test('wraps affiliations of every person field in a list without splitting', () => {
    const metadata = {
      title: 'Titre',
      authors: [
        {
          forename: 'A',
          affiliations: 'Université de Montréal, Université Paris Cité',
        },
        { forename: 'B', affiliations: ' Maison MONA; UQAM ' },
      ],
      reviewers: [{ affiliations: 'Univ R' }],
      transcribers: [{ affiliations: 'Univ T' }],
      translators: [{ affiliations: 'Univ Tr' }],
      issueDirectors: [{ affiliations: 'Univ I' }],
      journalDirectors: [{ affiliations: 'Univ J' }],
    }
    assert.strictEqual(normalizeAffiliations(metadata), true)
    assert.deepStrictEqual(metadata, {
      title: 'Titre',
      authors: [
        {
          forename: 'A',
          affiliations: ['Université de Montréal, Université Paris Cité'],
        },
        { forename: 'B', affiliations: ['Maison MONA; UQAM'] },
      ],
      reviewers: [{ affiliations: ['Univ R'] }],
      transcribers: [{ affiliations: ['Univ T'] }],
      translators: [{ affiliations: ['Univ Tr'] }],
      issueDirectors: [{ affiliations: ['Univ I'] }],
      journalDirectors: [{ affiliations: ['Univ J'] }],
    })
  })

  test('converts nested persons (journal corpus issue directors)', () => {
    const metadata = {
      type: 'journal',
      issue: { directors: [{ surname: 'D', affiliations: 'Univ D' }] },
    }
    assert.strictEqual(normalizeAffiliations(metadata), true)
    assert.deepStrictEqual(metadata.issue.directors[0].affiliations, ['Univ D'])
  })

  test('removes empty affiliations', () => {
    const metadata = { authors: [{ forename: 'A', affiliations: '  ' }] }
    assert.strictEqual(normalizeAffiliations(metadata), true)
    assert.deepStrictEqual(metadata, { authors: [{ forename: 'A' }] })
  })

  test('leaves metadata already in list format untouched', () => {
    const metadata = {
      authors: [{ affiliations: ['Univ A', 'Univ B'] }, { forename: 'B' }],
    }
    assert.strictEqual(normalizeAffiliations(metadata), false)
    assert.deepStrictEqual(metadata, {
      authors: [{ affiliations: ['Univ A', 'Univ B'] }, { forename: 'B' }],
    })
  })
})
