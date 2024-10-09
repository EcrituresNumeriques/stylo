import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import setupStore from '../src/createReduxStore.js'

export function renderWithProviders(component, extendedRenderOptions = {}) {
  const {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  } = extendedRenderOptions

  function Wrapper ({ children }) {
    <Provider store={store}>{children}</Provider>
  }

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(component, { wrapper: Wrapper, ...renderOptions })
  }
}
