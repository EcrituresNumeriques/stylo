import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

describe('CollaborativeEditorWriters', () => {
  test('renders an empty list by default', () => {
    renderWithProviders(<CollaborativeEditorWriters />)
    expect(screen.getByRole('list')).toBeEmptyDOMElement()
  })

  test('renders one avatar per writer', () => {
    const writers = {
      'user-1': {
        user: { _id: 'user-1', displayName: 'Alice', color: '#ff0000' },
      },
      'user-2': {
        user: { _id: 'user-2', displayName: 'Bob', color: '#0000ff' },
      },
    }

    renderWithProviders(<CollaborativeEditorWriters writers={writers} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByTitle('Alice')).toBeInTheDocument()
    expect(screen.getByTitle('Bob')).toBeInTheDocument()
  })

  test('falls back to username when displayName is absent', () => {
    const writers = {
      'user-1': { user: { _id: 'user-1', username: 'alice42' } },
    }

    renderWithProviders(<CollaborativeEditorWriters writers={writers} />)

    expect(screen.getByTitle('alice42')).toBeInTheDocument()
  })
})
