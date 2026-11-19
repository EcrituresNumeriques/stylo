import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import i18n from '../../../i18n.js'
import EditorMenu from './EditorMenu.jsx'

describe('EditorMenu', () => {
  test('shows the Nakala menu when the nakala feature is enabled', () => {
    renderWithProviders(<EditorMenu articleId="a1" onChange={vi.fn()} />, {
      preloadedState: { activeUser: { features: ['nakala'] } },
    })
    expect(screen.getByTitle(i18n.t('data.title'))).toBeInTheDocument()
  })

  test('hides the Nakala menu when the nakala feature is disabled', () => {
    renderWithProviders(<EditorMenu articleId="a1" onChange={vi.fn()} />, {
      preloadedState: { activeUser: { features: [] } },
    })
    expect(screen.queryByTitle(i18n.t('data.title'))).not.toBeInTheDocument()
  })
})
