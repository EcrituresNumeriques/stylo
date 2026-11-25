import { useRouteLoaderData } from 'react-router'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'
import EditorMenuContent from './EditorMenuContent.jsx'

vi.mock('../nakala/ArticleData.jsx', () => ({ default: () => 'Nakala' }))

describe('EditorMenuContent', () => {
  test('ignores a stored "data" menu without the nakala feature', () => {
    useRouteLoaderData.mockReturnValue({ article: {} })
    const { container } = renderWithProviders(
      <EditorMenuContent articleId="1" activeMenu="data" />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
