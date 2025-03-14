import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../../tests/setup.js'
import Component from './TagEditForm.jsx'

describe('TagEditForm', () => {
  const preloadedState = {
    activeUser: { _id: 'test-user-id' },
  }
  const emptyTag = {}

  const existingTag = {
    _id: 'tag-id',
    name: 'existing tag',
    color: '#fc0',
    description: '',
  }

  test('requires name to be populated', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    fetch.mockRestore().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            user: {
              tags: [],
            },
          },
        }),
    })

    renderWithProviders(<Component tag={emptyTag} onSubmit={onSubmit} />, {
      preloadedState,
    })

    expect(screen.getByRole('form')).toBeInTheDocument()

    const submitButton = screen.getByText('Create')
    await user.click(submitButton)
    expect(screen.getByLabelText('Name')).toBeInvalid()
  })

  test('creates a new tag', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    fetch.mockRestore().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            user: {
              tags: [],
            },
          },
        }),
    })

    renderWithProviders(<Component tag={emptyTag} onSubmit={onSubmit} />, {
      preloadedState,
    })

    const createdTag = { ...existingTag, name: 'new tag' }

    fetch.mockRestore().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            createTag: createdTag,
          },
        }),
    })

    const submitButton = screen.getByText('Create')

    screen.getByLabelText('Name').focus()
    await userEvent.keyboard('new tag')

    await user.click(submitButton)
    expect(screen.getByLabelText('Name')).toBeValid()
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(createdTag)
  })

  test('updates an existing tag', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    fetch.mockRestore().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            user: {
              tags: [existingTag],
            },
          },
        }),
    })

    const updatedTag = {
      ...existingTag,
      name: 'update tag',
    }

    renderWithProviders(<Component tag={existingTag} onSubmit={onSubmit} />, {
      preloadedState,
    })

    fetch.mockRestore().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            updateTag: updatedTag,
          },
        }),
    })

    const submitButton = screen.getByText('Update')

    screen.getByLabelText('Name').focus()
    await userEvent.keyboard('update tag')

    await user.click(submitButton)
    expect(screen.getByLabelText('Name')).toBeValid()
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(updatedTag)
  })
})
