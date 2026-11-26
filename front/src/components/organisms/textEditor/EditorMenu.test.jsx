import { screen } from '@testing-library/react'
import { useRouteLoaderData } from 'react-router'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import EditorMenu from './EditorMenu.jsx'

vi.mock('../../atoms/NakalaIcon.jsx', () => ({ default: () => 'Nakala' }))

describe('EditorMenu', () => {
  test('shows the Nakala menu with the nakala feature only', () => {
    renderWithProviders(<EditorMenu articleId="1" onChange={vi.fn()} />)
    expect(screen.queryByText('Nakala')).not.toBeInTheDocument()

    useRouteLoaderData.mockReturnValue({ user: { features: ['nakala'] } })
    renderWithProviders(<EditorMenu articleId="1" onChange={vi.fn()} />)
    expect(screen.getByText('Nakala')).toBeInTheDocument()
  })
})
