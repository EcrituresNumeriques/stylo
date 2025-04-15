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
      'Authentication failure'
    )

    expect(
      getByText('Unable to locate authentication token.')
    ).toBeInTheDocument()

    expect(getByRole('link')).toHaveTextContent('Back to Stylo')
  })

  test('display a warning in case of unknown service', () => {
    window.opener = null
    // vi.mocked(useLocation).mockReturnValue({ hash: '' })
    // vi.mocked(useParams).mockReturnValue({ service: 'aaa' })

    const { getByText } = renderWithProviders(<Component />, {
      path: '/credentials/auth-callback/:service',
      route: '/credentials/auth-callback/aaa',
    })

    expect(getByText('Unknown authentication provider.')).toBeInTheDocument()
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
      getByText('Stylo account has been linked to zotero.')
    ).toBeInTheDocument()

    expect(getByRole('button')).toHaveTextContent('Back to Stylo')

    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'SET_AUTH_TOKEN',
        service,
        token,
      })
    )
  })
})
