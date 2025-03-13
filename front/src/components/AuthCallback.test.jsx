import { describe, expect, test, vi } from 'vitest'
import React from 'react'
import Component from './AuthCallback.jsx'
import { renderWithProviders } from '../../tests/setup.js'

describe('AuthCallback', () => {
  test('display with no hash info and no opener', () => {
    window.opener = null

    const { getByRole, getByText } = renderWithProviders(<Component />, {
      path: '/credentials/auth-callback/:service',
      route: '/credentials/auth-callback/zotero',
    })

    expect(getByRole('heading', { level: 2 })).toHaveTextContent(
      'credentials.authentication.error.title'
    )

    expect(
      getByText('credentials.authentication.error.noToken')
    ).toBeInTheDocument()

    expect(getByRole('link')).toHaveTextContent(
      'credentials.authentication.back'
    )
  })

  test('display a warning in case of unknown service', () => {
    window.opener = null
    // vi.mocked(useLocation).mockReturnValue({ hash: '' })
    // vi.mocked(useParams).mockReturnValue({ service: 'aaa' })

    const { getByText } = renderWithProviders(<Component />, {
      path: '/credentials/auth-callback/:service',
      route: '/credentials/auth-callback/aaa',
    })

    expect(
      getByText('credentials.authentication.error.unknownService')
    ).toBeInTheDocument()
  })

  test('sends the credentials back to the opening window', () => {
    const service = 'zotero'
    const token = 'abcd'
    const postMessage = vi.fn()

    window.opener = { postMessage }

    const { getByRole, getByText } = renderWithProviders(<Component />, {
      path: '/credentials/auth-callback/:service',
      route: `/credentials/auth-callback/${service}#token=${token}`,
    })

    expect(
      getByText('credentials.authentication.success.description')
    ).toBeInTheDocument()

    expect(getByRole('button')).toHaveTextContent(
      'credentials.authentication.back'
    )

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'SET_AUTH_TOKEN',
        service,
        token,
      })
    )
  })
})
