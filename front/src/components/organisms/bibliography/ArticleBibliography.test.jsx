import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'

import ArticleBibliography from './ArticleBibliography.jsx'

vi.mock('../../../hooks/article.js', () => ({
  useEditableArticle: () => ({
    bibliography: { bibtex: '', entries: [] },
    article: { zoteroLink: '' },
    isLoading: false,
    updateBibliography: vi.fn(),
    error: null,
  }),
}))

vi.mock('./BibliographyReferenceList.jsx', () => ({
  default: ({ readOnly }) => (
    <div data-testid="reference-list" data-readonly={String(readOnly)} />
  ),
}))

vi.mock('./BibliographyBibtexEditor.jsx', () => ({
  default: () => <div />,
}))

vi.mock('./BibliographyZoteroImport.jsx', () => ({
  default: () => <div />,
}))

const alice = { user: { id: 'alice', displayName: 'Alice' } }
const bob = { user: { id: 'bob', displayName: 'Bob' } }

/**
 * Boutons d'action du panneau (import Zotero, ajout d'une référence).
 * @param {HTMLElement} container
 * @returns {HTMLButtonElement[]}
 */
function headingActions(container) {
  return Array.from(container.querySelectorAll('section > div > button'))
}

describe('ArticleBibliography', () => {
  test('is editable when nobody else is on the article', () => {
    const { container, queryByRole, getByTestId } = renderWithProviders(
      <ArticleBibliography articleId="6afb023e23970475e33bd7c1" />
    )

    expect(queryByRole('alert')).not.toBeInTheDocument()
    expect(getByTestId('reference-list')).toHaveAttribute(
      'data-readonly',
      'false'
    )
    expect(headingActions(container)).toHaveLength(2)
    for (const button of headingActions(container)) {
      expect(button).toBeEnabled()
    }
  })

  test('is editable when the user is alone on the article', () => {
    const { queryByRole, getByTestId } = renderWithProviders(
      <ArticleBibliography
        articleId="6afb023e23970475e33bd7c1"
        writers={{ 1: alice }}
      />
    )

    expect(queryByRole('alert')).not.toBeInTheDocument()
    expect(getByTestId('reference-list')).toHaveAttribute(
      'data-readonly',
      'false'
    )
  })

  test('is read-only when several people are on the article', () => {
    const { container, getByRole, getByTestId } = renderWithProviders(
      <ArticleBibliography
        articleId="6afb023e23970475e33bd7c1"
        writers={{ 1: alice, 2: bob }}
      />
    )

    expect(getByRole('alert')).toBeInTheDocument()
    expect(getByTestId('reference-list')).toHaveAttribute(
      'data-readonly',
      'true'
    )
    expect(headingActions(container)).toHaveLength(2)
    for (const button of headingActions(container)) {
      expect(button).toBeDisabled()
    }
  })
})
