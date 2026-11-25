import React, { Children } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { createRoutesStub } from 'react-router'
import { afterEach, vi } from 'vitest'

import { forgetAccountPreferences } from '../src/helpers/preferences.js'
import i18n from '../src/i18n.js'
import '../src/i18n.js'

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'

// mock queryCommandSupported
document.queryCommandSupported = () => true

// mock Fetch requests
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: vi.fn(),
  headers: new Headers(),
  text: vi.fn().mockResolvedValue(''),
  json: vi.fn().mockResolvedValue({}),
})

vi.mock('react-router', async (importOriginal) => {
  const mod = await importOriginal()

  return {
    ...mod,
    useRouteLoaderData: vi.fn(() => ({ user: null })),
  }
})

// remove once https://github.com/jsdom/jsdom/issues/3294 is fixed
HTMLDialogElement.prototype.show = vi.fn(function mock() {
  this.open = true
})

HTMLDialogElement.prototype.showModal = vi.fn(function mock() {
  this.open = true
})

HTMLDialogElement.prototype.close = vi.fn(function mock() {
  this.open = false
})

globalThis.alert = console.error

afterEach(() => {
  cleanup()
  localStorage.clear()
  forgetAccountPreferences()
  vi.clearAllMocks()
})

export function renderWithProviders(
  ui,
  {
    route = '/test',
    path = '/test',
    extraRoutes = [],
    loader,
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    const Stub = createRoutesStub([
      {
        path,
        index: true,
        loader,
        Component() {
          return Children.toArray(children)
        },
      },
      ...extraRoutes,
    ])

    return React.createElement(
      I18nextProvider,
      { i18n },
      React.createElement(
        HelmetProvider,
        null,
        React.createElement(Stub, { initialEntries: [route] })
      )
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}
