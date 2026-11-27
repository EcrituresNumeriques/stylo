import { beforeEach, describe, expect, test, vi } from 'vitest'

// records the order in which the Monaco modules are evaluated
const evaluated = []
const api = {
  editor: { defineTheme: vi.fn() },
  languages: { register: () => {} },
}
const editorZoom = { setZoomLevel: vi.fn(), onDidChangeZoomLevel: vi.fn() }

/** vi.doMock, after vi.resetModules(), evaluates the mocked modules again */
function mockMonaco() {
  const record = (name, exports = {}) => {
    evaluated.push(name)
    return exports
  }
  vi.doMock('@monaco-editor/react', () => ({ loader: { config: vi.fn() } }))
  vi.doMock('monaco-editor/nls/lang/fr.js', () => record('fr'))
  vi.doMock('monaco-editor/nls/lang/es.js', () => record('es'))
  vi.doMock('monaco-editor/editor', () => record('editor', api))
  vi.doMock('monaco-editor/editor/common/config/editorZoom.js', () => ({
    EditorZoom: editorZoom,
  }))
  vi.doMock('monaco-editor/editor/editor.worker?worker', () => ({
    default: class extends EventTarget {},
  }))
  vi.doMock('monaco-editor/features/register.all.js', () => record('features'))
  vi.doMock('monaco-editor/languages/definitions/markdown/register.js', () =>
    record('markdown')
  )
}

describe('loadMonaco', () => {
  let monaco

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    localStorage.clear()
    evaluated.length = 0
    mockMonaco()
    monaco = await import('./monaco.js')
  })

  test('loads the translation, then Monaco, and configures @monaco-editor/react', async () => {
    const { loader } = await import('@monaco-editor/react')
    expect(monaco.monaco).toBeUndefined()

    const loaded = await monaco.loadMonaco({ locale: 'fr' })

    expect(evaluated.slice(0, 2)).toEqual(['fr', 'editor'])
    expect(loaded.languages).toBe(api.languages)
    expect(monaco.monaco).toBe(loaded)
    expect(loader.config).toHaveBeenCalledWith({ monaco: loaded })
  })

  test('reloads the page when the worker file can not be loaded', async () => {
    vi.doMock('../../helpers/staleRelease.js', async (importOriginal) => ({
      ...(await importOriginal()),
      reloadForMissingFile: vi.fn(),
    }))
    vi.resetModules()
    monaco = await import('./monaco.js')
    const { reloadForMissingFile } = await import(
      '../../helpers/staleRelease.js'
    )
    await monaco.loadMonaco()

    const worker = self.MonacoEnvironment.getWorker()
    const runtimeError = new Event('error')
    runtimeError.message = 'Uncaught TypeError: x is not a function'
    worker.dispatchEvent(runtimeError)
    expect(reloadForMissingFile).not.toHaveBeenCalled()

    // file of a previous release: not found
    worker.dispatchEvent(new Event('error'))
    expect(reloadForMissingFile).toHaveBeenCalledTimes(1)
    vi.doUnmock('../../helpers/staleRelease.js')
  })

  test('defines the stylo theme', async () => {
    const { STYLO_THEME } = await import('../organisms/monaco/theme.js')

    await monaco.loadMonaco()

    expect(api.editor.defineTheme).toHaveBeenCalledWith(
      STYLO_THEME,
      expect.objectContaining({ base: 'vs' })
    )
  })

  test('applies the saved font zoom, and saves its changes', async () => {
    const { getPreferences, setPreference } = await import(
      '../../helpers/preferences.js'
    )
    setPreference('editor', 'zoomLevel', 2)

    await monaco.loadMonaco()
    expect(editorZoom.setZoomLevel).toHaveBeenCalledWith(2)

    const onZoomChange = editorZoom.onDidChangeZoomLevel.mock.lastCall[0]
    onZoomChange(-1)
    expect(getPreferences('editor').zoomLevel).toBe(-1)
  })

  test('loads no translation in English', async () => {
    await monaco.loadMonaco({ locale: 'en' })
    expect(evaluated).not.toContain('fr')
  })

  test('loads each language once', async () => {
    const custom = { id: 'custom', load: vi.fn() }

    await monaco.loadMonaco({ language: 'markdown' })
    await monaco.loadMonaco({ language: custom })
    await monaco.loadMonaco({ language: custom })

    expect(evaluated).toContain('markdown')
    expect(custom.load).toHaveBeenCalledExactlyOnceWith(monaco.monaco)
    expect(monaco.languageConfig('markdown').id).toBe('markdown')
    expect(monaco.languageConfig(custom)).toBe(custom)
    expect(monaco.languageConfig('unknown')).toBeUndefined()
  })
})
