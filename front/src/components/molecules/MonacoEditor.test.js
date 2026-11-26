import { describe, expect, test, vi } from 'vitest'

import { applyPlugins } from './MonacoEditor.jsx'

function createFakeEditor() {
  const listeners = []
  return {
    onDidDispose: (listener) => listeners.push(listener),
    dispose: () => {
      for (const listener of listeners) listener()
    },
  }
}

// lets the plugin setups, chained on promises, run
const settle = () => new Promise((resolve) => setTimeout(resolve))

describe('applyPlugins', () => {
  test('sets up the plugins, and cleans them up with the editor', async () => {
    const editor = createFakeEditor()
    const api = {}
    const cleanup = vi.fn()
    const asyncCleanup = vi.fn()
    const plugins = [
      { setup: vi.fn(() => cleanup) },
      { setup: vi.fn(async () => asyncCleanup) },
      { setup: vi.fn() },
    ]

    applyPlugins(editor, api, plugins)
    await settle()
    for (const { setup } of plugins) {
      expect(setup).toHaveBeenCalledWith(editor, api)
    }
    expect(cleanup).not.toHaveBeenCalled()

    editor.dispose()
    expect(cleanup).toHaveBeenCalledOnce()
    expect(asyncCleanup).toHaveBeenCalledOnce()
  })

  test('cleans up at once a setup that ends after the editor is disposed', async () => {
    const editor = createFakeEditor()
    const cleanup = vi.fn()
    let endSetup
    const setupEnded = new Promise((resolve) => (endSetup = resolve))

    applyPlugins(editor, {}, [{ setup: () => setupEnded.then(() => cleanup) }])
    editor.dispose()
    endSetup()
    await settle()

    expect(cleanup).toHaveBeenCalledOnce()
  })

  test('a failing plugin does not prevent the others', async () => {
    const error = new Error('broken')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const working = { setup: vi.fn() }
    const throwing = {
      setup: () => {
        throw error
      },
    }

    applyPlugins(createFakeEditor(), {}, [
      throwing,
      { setup: () => Promise.reject(error) },
      working,
    ])
    await settle()

    expect(working.setup).toHaveBeenCalledOnce()
    expect(consoleError).toHaveBeenCalledTimes(2)
    expect(consoleError).toHaveBeenCalledWith(
      'Monaco plugin setup failed',
      error
    )
    consoleError.mockRestore()
  })
})
