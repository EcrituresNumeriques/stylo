import React from 'react'
import { describe, expect, test, vi } from 'vitest'

import { renderWithProviders } from '../../tests/setup.js'

import Component from './AuthCallback.jsx'

describe('AuthCallback', () => {
  test('displays a warning when no ongoing session (w/ opener)', async () => {
    window.opener = { postMessage: vi.fn() }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          errors: [
            {
              message: 'No remote account data found',
              extensions: {
                type: 'ACCOUNT_NOT_FOUND',
                errors: ['No remote account data found'],
              },
            },
          ],
          data: { user: null },
        }),
    })

    const { findByRole, getByRole, getByText } = renderWithProviders(
      <Component />,
      {
        path: '/credentials/auth-callback/:service',
        route: '/credentials/auth-callback/zotero',
      }
    )

    await findByRole('heading')

    expect(getByRole('heading', { level: 2 })).toHaveTextContent(
      'Authentication failure'
    )

    expect(
      getByText(
        'We did not manage to link Zotero service. Error code: ACCOUNT_NOT_FOUND.'
      )
    ).toBeInTheDocument()

    expect(getByRole('button')).toHaveTextContent('Back to Stylo')
  })

  test('displays a warning when no ongoing session (w/o opener)', async () => {
    window.opener = null

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          errors: [
            {
              message: 'No remote account data found',
              extensions: {
                type: 'ACCOUNT_NOT_FOUND',
                errors: ['No remote account data found'],
              },
            },
          ],
          data: { user: null },
        }),
    })

    const { findByRole, getByRole } = renderWithProviders(<Component />, {
      path: '/credentials/auth-callback/:service',
      route: '/credentials/auth-callback/zotero',
    })

    await findByRole('heading')

    expect(getByRole('link')).toHaveTextContent('Back to Stylo')
  })

  test('gets an updated user with merged session data (w/ opener)', async () => {
    window.opener = { postMessage: vi.fn() }

    fetch.mockRestore()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            setAuthToken: {
              authProviders: {
                hypothesis: {
                  id: 'accnt:example@hypothes.is',
                },
              },
            },
          },
        }),
    })

    renderWithProviders(<Component />, {
      path: '/credentials/auth-callback/:service',
      route: '/credentials/auth-callback/aaa',
    })

    await vi.waitFor(() => {
      return expect(window.opener.postMessage).toHaveBeenCalled()
    })

    expect(window.opener.postMessage).toHaveBeenCalledWith(
      JSON.stringify({
        hypothesis: {
          id: 'accnt:example@hypothes.is',
        },
      })
    )
  })

  test('gets an updated user with merged session (w/o opener)', async () => {
    const service = 'zotero'

    window.opener = null
    window.close = vi.fn()

    fetch.mockRestore()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            setAuthToken: {
              authProviders: {
                hypothesis: {
                  id: 'accnt:example@hypothes.is',
                },
              },
            },
          },
        }),
    })

    renderWithProviders(<Component />, {
      path: '/credentials/auth-callback/:service',
      route: `/credentials/auth-callback/${service}`,
    })

    await vi.waitFor(() => {
      return expect(window.close).toHaveBeenCalled()
    })

    expect(window.close).toHaveBeenCalledOnce()
  })
})
