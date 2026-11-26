import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SWRConfig } from 'swr'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../../../tests/setup.js'

import Component from './InstanceVersions.jsx'

function renderComponent(versions) {
  fetch.mockResolvedValue({ json: async () => versions })

  // un cache SWR par test, pour ne pas réutiliser la réponse du test précédent
  return renderWithProviders(
    <SWRConfig value={{ provider: () => new Map() }}>
      <Component />
    </SWRConfig>
  )
}

describe('InstanceVersions', () => {
  test('affiche les versions une fois le bouton activé', async () => {
    const user = userEvent.setup()
    renderComponent({
      name: 'stylo-graphql',
      version: '4.0.0',
      exportVersion: '4.1.2',
      pandocApiVersion: '4.1.1',
    })

    const button = await screen.findByRole('button', {
      name: 'Versions of the export services',
    })
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/version$/))
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('4.1.2')).not.toBeVisible()

    await user.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('4.1.2')).toBeVisible()
    expect(screen.getByText('4.1.1')).toBeVisible()

    await user.keyboard('{Escape}')

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  test("n'affiche que la version connue", async () => {
    const user = userEvent.setup()
    renderComponent({ exportVersion: '4.1.2', pandocApiVersion: null })

    await user.click(await screen.findByRole('button'))

    expect(screen.getByText('Stylo export')).toBeVisible()
    expect(screen.queryByText('Pandoc API')).not.toBeInTheDocument()
  })

  test("n'affiche rien quand aucune version n'est renseignée", async () => {
    renderComponent({ name: 'stylo-graphql', version: '4.0.0' })

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
