import { afterEach, vi } from 'vitest'
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import '@testing-library/jest-dom/vitest'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Switch } from 'react-router-dom'
import createReduxStore, { initialState } from '../src/createReduxStore.js'
import i18n from '../src/i18n.js'

import merge from 'lodash.merge'
import '../src/i18n.js'

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
    preloadedState = {},
    route = '/',
    path = '/',
    store = createReduxStore(merge({}, initialState, preloadedState)),
    currentUser = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    /* eslint-disable-next-line react/no-children-prop */
    return React.createElement(Provider, {
      store,
      children: React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(
          MemoryRouter,
          { initialEntries: [route] },
          React.createElement(
            Switch,
            {},
            React.createElement(
              Route,
              {
                path,
              },
              children
            )
          )
        )
      ),
    })
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
