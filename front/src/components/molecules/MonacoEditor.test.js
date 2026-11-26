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
  const api = {}

  test('sets up each plugin with the editor and Monaco', async () => {
    const editor = createFakeEditor()
    const plugins = [{ setup: vi.fn() }, { setup: vi.fn() }]

    applyPlugins(editor, api, plugins)
    await settle()

    for (const plugin of plugins) {
      expect(plugin.setup).toHaveBeenCalledWith(editor, api)
    }
  })

  test('cleans up when the editor is disposed', async () => {
    const editor = createFakeEditor()
    const cleanup = vi.fn()
    const asyncCleanup = vi.fn()

    applyPlugins(editor, api, [
      { setup: () => cleanup },
      { setup: async () => asyncCleanup },
      { setup: () => undefined },
    ])
    await settle()
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

    applyPlugins(editor, api, [{ setup: () => setupEnded.then(() => cleanup) }])
    editor.dispose()
    expect(cleanup).not.toHaveBeenCalled()

    endSetup()
    await settle()
    expect(cleanup).toHaveBeenCalledOnce()
  })

  test('a failing plugin does not prevent the others', async () => {
    const editor = createFakeEditor()
    const error = new Error('broken')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const working = { setup: vi.fn() }

    applyPlugins(editor, api, [
      {
        setup: () => {
          throw error
        },
      },
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
