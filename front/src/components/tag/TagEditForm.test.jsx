import { describe, expect, test, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../../tests/setup.js'
import Component from './TagEditForm.jsx'
import { unstable_serialize } from 'swr'
import { getTags as getTagsQuery } from '../Tag.graphql'
import { print } from 'graphql/language/printer'
import { mutate } from 'swr'

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
  const newTag = {
    _id: 1,
    name: 'test tag',
    color: '#ccc',
    description: '',
  }

  const cacheKey = unstable_serialize({
    variables: {},
    query: print(getTagsQuery),
    sessionToken: null,
  })

  test('requires name to be populated', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<Component tag={emptyTag} onSubmit={onSubmit} />, {
      preloadedState,
    })

    expect(screen.getByRole('form')).toBeInTheDocument()

    const submitButton = screen.getByText('tag.createForm.buttonText')
    await user.click(submitButton)
    expect(screen.getByLabelText('tag.createForm.nameField')).toBeInvalid()
  })

  test('creates a new tag', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    mutate(cacheKey, {
      user: {
        tags: [],
      },
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

    const submitButton = screen.getByText('tag.createForm.buttonText')

    screen.getByLabelText('tag.createForm.nameField').focus()
    await userEvent.keyboard('new tag')

    await user.click(submitButton)
    expect(screen.getByLabelText('tag.createForm.nameField')).toBeValid()
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(createdTag)
  })

  test('updates an existing tag', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    mutate(cacheKey, {
      user: {
        tags: [existingTag],
      },
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

    const submitButton = screen.getByText('tag.editForm.buttonText')

    screen.getByLabelText('tag.createForm.nameField').focus()
    await userEvent.keyboard('update tag')

    await user.click(submitButton)
    expect(screen.getByLabelText('tag.createForm.nameField')).toBeValid()
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(updatedTag)
  })
})
