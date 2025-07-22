import React, { Children } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createRoutesStub } from 'react-router'
import { afterEach, vi } from 'vitest'

import i18n from '../src/i18n.js'
import '../src/i18n.js'

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'

// mock Fetch requests
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: vi.fn(),
  headers: new Headers(),
  text: vi.fn().mockResolvedValue(''),
  json: vi.fn().mockResolvedValue({}),
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
  vi.clearAllMocks()
})

export function renderWithProviders(
  ui,
  {
    appLoaderState = {
      user: { _id: '123' },
    },
    route = '/test',
    path = '/test',
    extraRoutes = [],
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    const Stub = createRoutesStub([
      {
        path,
        id: 'app',
        loader() {
          return appLoaderState
        },
        index: true,
        Component() {
          return Children.toArray(children)
        },
      },
      ...extraRoutes,
    ])

    /* eslint-disable-next-line react/no-children-prop */
    return React.createElement(
      I18nextProvider,
      { i18n },
      React.createElement(Stub, { initialEntries: [route] })
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
