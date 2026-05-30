import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import ArticleStats from './ArticleStats.jsx'

describe('ArticleStats', () => {
  test('renders all counters at zero by default', () => {
    renderWithProviders(<ArticleStats />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText(/0 words/)).toBeInTheDocument()
    expect(screen.getByText(/0 characters/)).toBeInTheDocument()
    expect(screen.getByText(/0 citations/)).toBeInTheDocument()
  })

  test('renders stats passed as props', () => {
    renderWithProviders(
      <ArticleStats
        stats={{
          wordCount: 42,
          charCountNoSpace: 200,
          charCountPlusSpace: 240,
          citationNb: 5,
        }}
      />
    )
    expect(screen.getByText(/42 words/)).toBeInTheDocument()
    expect(
      screen.getByText(/200 characters \(240 with spaces\)/)
    ).toBeInTheDocument()
    expect(screen.getByText(/5 citations/)).toBeInTheDocument()
  })

  test('uses singular form for 1 word, 1 character, 1 citation', () => {
    renderWithProviders(
      <ArticleStats
        stats={{
          wordCount: 1,
          charCountNoSpace: 1,
          charCountPlusSpace: 1,
          citationNb: 1,
        }}
      />
    )
    expect(screen.getByText(/1 word/)).toBeInTheDocument()
    expect(screen.getByText(/1 character/)).toBeInTheDocument()
    expect(screen.getByText(/1 citation/)).toBeInTheDocument()
  })
})
