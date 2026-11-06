import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'

import Component from './TagsList.jsx'

describe('TagsList', () => {
  const preloadedState = {
    activeUser: { id: 'test-user-id' },
  }

  const tags = [
    { id: 'tag-1', name: 'first tag', color: '#fc0', description: '' },
    { id: 'tag-2', name: 'second tag', color: '#0cf', description: '' },
    { id: 'tag-3', name: 'third tag', color: '#f0c', description: '' },
  ]

  test('opens a single edit modal for the selected tag', async () => {
    const user = userEvent.setup()

    fetch.mockRestore()
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { user: { tags } } }),
    })

    renderWithProviders(<Component action={true} />, { preloadedState })

    await user.click(
      await screen.findByRole('button', { name: 'Edit tag first tag' })
    )

    let dialogs = screen.getAllByRole('dialog')
    expect(dialogs).toHaveLength(1)
    expect(within(dialogs[0]).getByLabelText('Name')).toHaveValue('first tag')

    await user.click(within(dialogs[0]).getByText('Close'))
    expect(screen.queryAllByRole('dialog')).toHaveLength(0)

    await user.click(
      screen.getByRole('button', { name: 'Edit tag second tag' })
    )

    dialogs = screen.getAllByRole('dialog')
    expect(dialogs).toHaveLength(1)
    expect(within(dialogs[0]).getByLabelText('Name')).toHaveValue('second tag')
  })
})
