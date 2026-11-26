import { beforeEach, describe, expect, test, vi } from 'vitest'

// records the order in which the Monaco modules are evaluated
const evaluated = []
const api = { languages: { register: () => {} } }

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
  vi.doMock('monaco-editor/editor/editor.worker?worker', () => ({
    default: class {},
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
