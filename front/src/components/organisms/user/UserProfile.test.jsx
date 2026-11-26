import { screen } from '@testing-library/react'
import { useRouteLoaderData } from 'react-router'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import UserProfile from './UserProfile.jsx'

describe('UserProfile', () => {
  test('shows the username only when there is one', () => {
    useRouteLoaderData.mockReturnValue({ user: { id: '1' } })
    const without = renderWithProviders(<UserProfile />)
    const terms = without.container.querySelectorAll('dt').length
    without.unmount()

    useRouteLoaderData.mockReturnValue({ user: { id: '1', username: 'thom4' } })
    const { container } = renderWithProviders(<UserProfile />)
    expect(screen.getByText('thom4')).toBeInTheDocument()
    expect(container.querySelectorAll('dt')).toHaveLength(terms + 1)
  })
})
