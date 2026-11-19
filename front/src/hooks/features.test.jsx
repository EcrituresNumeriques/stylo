import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../tests/setup.js'
import { useFeature } from './features.js'

function Feature({ name }) {
  const enabled = useFeature(name)
  return <p>{enabled ? 'enabled' : 'disabled'}</p>
}

describe('useFeature', () => {
  test('is enabled when the active user has the feature', () => {
    renderWithProviders(<Feature name="nakala" />, {
      preloadedState: { activeUser: { features: ['nakala'] } },
    })
    expect(screen.getByText('enabled')).toBeInTheDocument()
  })

  test('is disabled when the active user does not have the feature', () => {
    renderWithProviders(<Feature name="search" />, {
      preloadedState: { activeUser: { features: ['nakala'] } },
    })
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })

  test('is disabled when the active user has no features', () => {
    renderWithProviders(<Feature name="nakala" />, {
      preloadedState: { activeUser: { features: undefined } },
    })
    expect(screen.getByText('disabled')).toBeInTheDocument()
  })
})
