import React, { Children } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { Provider as ReduxProvider } from 'react-redux'
import { createRoutesStub } from 'react-router'
import { afterEach, vi } from 'vitest'

import i18n from '../src/i18n.js'
import '../src/i18n.js'

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import merge from 'lodash.merge'

import createReduxStore, { initialState } from '../src/createReduxStore.js'

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
    useRouteLoaderData: vi.fn(),
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
  vi.clearAllMocks()
})

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    route = '/test',
    path = '/test',
    extraRoutes = [],
    store = createReduxStore(merge({}, initialState, preloadedState)),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    const Stub = createRoutesStub([
      {
        path,
        index: true,
        Component() {
          return Children.toArray(children)
        },
      },
      ...extraRoutes,
    ])

    /* eslint-disable-next-line react/no-children-prop */
    return React.createElement(ReduxProvider, {
      store,
      children: React.createElement(
        I18nextProvider,
        { i18n },
        React.createElement(
          HelmetProvider,
          null,
          React.createElement(Stub, { initialEntries: [route] })
        )
      ),
    })
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
