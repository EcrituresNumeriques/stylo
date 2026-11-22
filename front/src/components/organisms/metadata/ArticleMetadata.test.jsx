import { act, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'

import ArticleMetadata from './ArticleMetadata.jsx'

const updateMetadata = vi.fn()

vi.mock('../../../hooks/article.js', () => ({
  useArticleMetadata: () => ({
    metadata: { title: '' },
    metadataFormType: 'default',
    metadataFormTypeOptions: [],
    metadataYaml: '',
    isLoading: false,
    updateMetadata,
    updateMetadataFormType: vi.fn(),
  }),
}))

describe('ArticleMetadata', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('saves metadata once the user stops typing', async () => {
    const { container } = renderWithProviders(
      <ArticleMetadata articleId="6afb023e23970475e33bd7c1" />
    )
    const title = container.querySelector('#root_title')

    fireEvent.change(title, { target: { value: 'H' } })
    fireEvent.change(title, { target: { value: 'He' } })
    fireEvent.change(title, { target: { value: 'Hello' } })
    expect(updateMetadata).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(500))

    expect(updateMetadata).toHaveBeenCalledOnce()
    expect(updateMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Hello' })
    )
  })

  test('saves pending changes when the panel is closed', () => {
    const { container, unmount } = renderWithProviders(
      <ArticleMetadata articleId="6afb023e23970475e33bd7c1" />
    )
    const title = container.querySelector('#root_title')

    fireEvent.change(title, { target: { value: 'Hello' } })
    unmount()

    expect(updateMetadata).toHaveBeenCalledOnce()
    expect(updateMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Hello' })
    )
  })
})
