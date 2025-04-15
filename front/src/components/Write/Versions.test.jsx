import {
  getByLabelText,
  getByRole,
  getByTestId,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { describe, expect, test } from 'vitest'
import { renderWithProviders } from '../../../tests/setup.js'
import Component from './Versions.jsx'

describe('Versions', () => {
  test('display versions', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        new Promise((resolve) =>
          resolve({
            data: {
              article: {
                updatedAt: new Date().toISOString(),
                versions: [
                  {
                    _id: '111',
                    version: 1,
                    revision: 1,
                    message: 'This is a version',
                    updatedAt: new Date().toISOString(),
                    owner: {
                      displayName: 'Guillaume',
                      username: 'ggrossetie',
                    },
                    type: 'userAction',
                  },
                ],
              },
            },
          })
        ),
    })

    renderWithProviders(<Component />)

    const versionsElement = await screen.findByTestId('versions')
    expect(versionsElement.children).toHaveLength(2) // working copy + version 1.1
  })

  test('create version', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () =>
        new Promise((resolve) =>
          resolve({
            data: {
              article: {
                updatedAt: new Date().toISOString(),
                versions: [],
              },
            },
          })
        ),
    })

    const user = userEvent.setup()

    renderWithProviders(<Component />)

    const createVersionButton = await screen.findByTestId(
      'create-version-button'
    )
    expect(createVersionButton).toBeInTheDocument()
    await user.click(createVersionButton)

    const createVersionForm = await screen.findByTestId('create-version-form')
    expect(createVersionForm).toBeInTheDocument()

    const submitButton = getByRole(createVersionForm, 'button', {
      name: 'Create',
    })
    const description = getByRole(createVersionForm, 'textbox', {
      label: 'Description',
    })
    description.focus()
    await userEvent.keyboard('This is a new version')
    await user.click(submitButton)

    expect(fetch).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        body: expect.stringMatching(
          /query":"mutation createVersion.*"major":false,"message":"This is a new version".*/
        ),
      })
    )
  })
})
