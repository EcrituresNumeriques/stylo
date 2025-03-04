import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, test } from 'vitest'
import { renderWithProviders } from '../../tests/setup.js'
import { useArticleActions, useArticleTagActions } from './article.js'

describe('Article', () => {
  test('add tag', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        new Promise((resolve) =>
          resolve({
            data: {
              article: {
                tags: [
                  { _id: '111', name: 'pending' },
                  { _id: '222', name: 'done' },
                ],
              },
            },
          })
        ),
    })
    const Component = () => {
      const { isLoading, error, tags, add } = useArticleTagActions({
        articleId: '444',
      })

      if (isLoading || error) {
        return <></>
      }

      return (
        <div>
          <ul>
            {tags?.map((t) => (
              <li key={t._id}>
                {t.name}
                <button
                  data-testid={'add-tag-' + t._id}
                  onClick={() => add(t._id)}
                ></button>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    renderWithProviders(<Component />, {})
    const addTagButton = await screen.findByTestId('add-tag-111')
    fireEvent.click(addTagButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"query addTags\(/),
      })
    )
  })
  test('remove tag', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        new Promise((resolve) =>
          resolve({
            data: {
              article: {
                tags: [{ _id: '222', name: 'done' }],
              },
            },
          })
        ),
    })
    const Component = () => {
      const { isLoading, error, tags, remove } = useArticleTagActions({
        articleId: '555',
      })

      if (isLoading || error) {
        return <></>
      }

      return (
        <div>
          <ul>
            {tags?.map((t) => (
              <li key={t._id}>
                {t.name}
                <button
                  data-testid={'remove-tag-' + t._id}
                  onClick={() => remove(t._id)}
                ></button>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    renderWithProviders(<Component />, {})
    const addTagButton = await screen.findByTestId('remove-tag-222')
    fireEvent.click(addTagButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"query removeTags\(/),
      })
    )
  })
  test('copy article', async () => {
    const Component = () => {
      const { copy } = useArticleActions({
        articleId: '666',
      })

      return (
        <div>
          <button data-testid="copy" onClick={() => copy('007')}></button>
        </div>
      )
    }
    renderWithProviders(<Component />, {})
    const addTagButton = await screen.findByTestId('copy')
    fireEvent.click(addTagButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"mutation duplicateArticle\(/),
      })
    )
  })
  test('duplicate article', async () => {
    const Component = () => {
      const { duplicate } = useArticleActions({
        articleId: '777',
      })

      return (
        <div>
          <button data-testid="duplicate" onClick={() => duplicate()}></button>
        </div>
      )
    }
    renderWithProviders(<Component />, {})
    const addTagButton = await screen.findByTestId('duplicate')
    fireEvent.click(addTagButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"mutation duplicateArticle\(/),
      })
    )
  })
  test('rename article', async () => {
    const Component = () => {
      const { rename } = useArticleActions({
        articleId: '777',
      })

      return (
        <div>
          <button
            data-testid="rename"
            onClick={() => rename('New title')}
          ></button>
        </div>
      )
    }
    renderWithProviders(<Component />, {})
    const addTagButton = await screen.findByTestId('rename')
    fireEvent.click(addTagButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"query renameArticle\(/),
      })
    )
  })
  test('remove article', async () => {
    const Component = () => {
      const { remove } = useArticleActions({
        articleId: '888',
      })

      return (
        <div>
          <button data-testid="remove" onClick={() => remove()}></button>
        </div>
      )
    }
    renderWithProviders(<Component />, {})
    const addTagButton = await screen.findByTestId('remove')
    fireEvent.click(addTagButton)
    expect(fetch).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(/"query":"query deleteArticle\(/),
      })
    )
  })
})
