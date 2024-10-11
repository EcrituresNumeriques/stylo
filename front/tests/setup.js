import { afterEach, vi } from 'vitest'
import React from 'react'
import { cleanup, render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Provider } from 'react-redux'
import createReduxStore, { initialState } from '../src/createReduxStore.js'
import merge from 'lodash.merge'

vi.mock('react-router-dom')

// mock Fetch requests
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: vi.fn(),
  headers: new Headers(),
  text: vi.fn().mockResolvedValue(''),
  json: vi.fn().mockResolvedValue({})
})
globalThis.alert = console.error

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn().mockReturnValue({
    t: vi.fn().mockImplementation(key => key)
  }),
  Translation: vi.fn()
}))

export function renderWithProviders (ui, { preloadedState = {}, store = createReduxStore(merge({}, initialState, preloadedState)), ...renderOptions } = {}) {
  function Wrapper ({ children }) {
    /* eslint-disable-next-line react/no-children-prop */
    return React.createElement(Provider, { store, children })
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions })}
}
