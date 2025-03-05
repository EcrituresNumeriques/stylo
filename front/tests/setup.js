import { afterEach, vi } from 'vitest'
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router'
import createReduxStore, { initialState } from '../src/createReduxStore.js'

import merge from 'lodash.merge'
import '../src/i18n.js'

// mock Fetch requests
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: vi.fn(),
  headers: new Headers(),
  text: vi.fn().mockResolvedValue(''),
  json: vi.fn().mockResolvedValue({}),
})

globalThis.alert = console.error

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

vi.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
  useTranslation: () => {
    return {
      t: (i18nKey) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    }
  },
  Translation: vi.fn(),
}))

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    route = '/',
    path = '/',
    store = createReduxStore(merge({}, initialState, preloadedState)),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    const router = createMemoryRouter(
      [
        {
          path: path,
          element: children,
        },
      ],
      { initialEntries: [route] }
    )
    /* eslint-disable-next-line react/no-children-prop */
    return React.createElement(Provider, {
      store,
      children: React.createElement(RouterProvider, { router }),
    })
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
