import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'

const structure = [
  { line: '## Introduction', index: 0, title: 'Introduction' },
  { line: '### Section 1.1', index: 5, title: '↳Section 1.1' },
  { line: '## Conclusion', index: 10, title: 'Conclusion' },
]

describe('ArticleTableOfContents', () => {
  test('renders the heading and an empty list by default', () => {
    renderWithProviders(<ArticleTableOfContents />)
    expect(
      screen.getByRole('heading', { name: /table of contents/i })
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  test('renders entries from the structure', () => {
    renderWithProviders(<ArticleTableOfContents structure={structure} />)
    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('↳Section 1.1')).toBeInTheDocument()
    expect(screen.getByText('Conclusion')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  test('calls onCursorPositionChange with the correct index on click', async () => {
    const user = userEvent.setup()
    const onCursorPositionChange = vi.fn()

    renderWithProviders(
      <ArticleTableOfContents
        structure={structure}
        onCursorPositionChange={onCursorPositionChange}
      />
    )

    await user.click(screen.getByText('Introduction'))
    expect(onCursorPositionChange).toHaveBeenCalledWith({
      lineNumber: 0,
      column: 0,
    })

    await user.click(screen.getByText('Conclusion'))
    expect(onCursorPositionChange).toHaveBeenCalledWith({
      lineNumber: 10,
      column: 0,
    })
  })

  test('does not throw when onCursorPositionChange is not provided', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ArticleTableOfContents structure={structure} />)

    await expect(
      user.click(screen.getByText('Introduction'))
    ).resolves.not.toThrow()
  })
})
