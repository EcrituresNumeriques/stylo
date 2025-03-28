import { fireEvent, screen } from '@testing-library/react'
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

    renderWithProviders(<Component />)

    const createVersionButton = await screen.findByTestId(
      'create-version-button'
    )
    expect(createVersionButton).toBeInTheDocument()
    //fireEvent.click(createVersionButton)
    //showModal is not implemented in jsdom as a result ref.current.showModal() will fail
  })
})
