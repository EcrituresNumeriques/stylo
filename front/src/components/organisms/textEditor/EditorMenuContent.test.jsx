import { screen } from '@testing-library/react'
import { useRouteLoaderData } from 'react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import EditorMenuContent from './EditorMenuContent.jsx'

vi.mock('../nakala/ArticleData.jsx', () => ({
  default: () => <p>Nakala data</p>,
}))

describe('EditorMenuContent', () => {
  beforeEach(() => {
    useRouteLoaderData.mockReturnValue({ article: {} })
  })

  test('shows the Nakala panel when the nakala feature is enabled', () => {
    renderWithProviders(
      <EditorMenuContent articleId="a1" activeMenu="data" />,
      {
        preloadedState: { activeUser: { features: ['nakala'] } },
      }
    )
    expect(screen.getByText('Nakala data')).toBeInTheDocument()
  })

  test('hides the Nakala panel when the nakala feature is disabled', () => {
    renderWithProviders(
      <EditorMenuContent articleId="a1" activeMenu="data" />,
      {
        preloadedState: { activeUser: { features: [] } },
      }
    )
    expect(screen.queryByText('Nakala data')).not.toBeInTheDocument()
  })
})
