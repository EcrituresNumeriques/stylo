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

  test('loads the translation before Monaco', async () => {
    await monaco.loadMonaco({ locale: 'fr' })

    expect(evaluated.indexOf('fr')).toBe(0)
    expect(evaluated).toContain('editor')
    expect(evaluated).toContain('features')
    expect(evaluated).not.toContain('es')
  })

  test('loads no translation in English', async () => {
    await monaco.loadMonaco({ locale: 'en' })

    expect(evaluated).not.toContain('fr')
    expect(evaluated).not.toContain('es')
  })

  test('exposes the Monaco API and configures @monaco-editor/react', async () => {
    const { loader } = await import('@monaco-editor/react')

    expect(monaco.monaco).toBeUndefined()
    const loaded = await monaco.loadMonaco()
    expect(loaded.languages).toBe(api.languages)
    expect(monaco.monaco).toBe(loaded)
    expect(loader.config).toHaveBeenCalledWith({ monaco: loaded })
  })

  test('loads a Monaco language', async () => {
    await monaco.loadMonaco({ language: 'markdown' })

    expect(evaluated).toContain('markdown')
  })

  test('loads our languages once, with the Monaco API', async () => {
    const language = { id: 'custom', load: vi.fn() }

    await monaco.loadMonaco({ language })
    await monaco.loadMonaco({ language })

    expect(language.load).toHaveBeenCalledOnce()
    expect(language.load).toHaveBeenCalledWith(monaco.monaco)
  })

  test('resolves the language config', () => {
    const custom = { id: 'custom', load() {} }

    expect(monaco.languageConfig('markdown').id).toBe('markdown')
    expect(monaco.languageConfig(custom)).toBe(custom)
    expect(monaco.languageConfig('unknown')).toBeUndefined()
    expect(monaco.languageConfig()).toBeUndefined()
  })
})
