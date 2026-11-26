import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getPreferences, setPreference } from '../../helpers/preferences.js'
import { editorFonts } from '../organisms/monaco/fonts.js'
import chooseEditorFont, { followEditorFont } from './monacoFont.js'

function createFakeEditor() {
  const actions = []
  return {
    actions,
    updateOptions: vi.fn(),
    addAction: vi.fn((action) => {
      const disposable = { ...action, dispose: vi.fn() }
      actions.push(disposable)
      return disposable
    }),
  }
}

const api = { editor: { remeasureFonts: vi.fn() } }
const plugin = chooseEditorFont({ action: (font) => `Police : ${font}` })
const [inter, , , , jetbrainsMono] = editorFonts

describe('chooseEditorFont', () => {
  let load

  beforeEach(() => {
    vi.clearAllMocks()
    setPreference('editor', 'fontFamily', 'inter')
    load = vi.fn(() => Promise.resolve())
    Object.defineProperty(document, 'fonts', {
      value: { load },
      configurable: true,
    })
  })

  afterEach(() => {
    delete document.fonts
  })

  test('applies the saved font, then remeasures it once loaded', async () => {
    setPreference('editor', 'fontFamily', 'jetbrains-mono')
    const editor = createFakeEditor()

    plugin.setup(editor, api)
    await Promise.resolve()

    expect(editor.updateOptions).toHaveBeenCalledWith({
      fontFamily: jetbrainsMono.family,
    })
    expect(load).toHaveBeenCalledWith(`1em ${jetbrainsMono.family}`)
    expect(api.editor.remeasureFonts).toHaveBeenCalledOnce()
  })

  test('falls back to Inter for an unknown font', () => {
    setPreference('editor', 'fontFamily', 'comic-sans')
    const editor = createFakeEditor()

    plugin.setup(editor, api)

    expect(editor.updateOptions).toHaveBeenCalledWith({
      fontFamily: inter.family,
    })
  })

  test('applies the font without remeasuring when the browser cannot tell', () => {
    delete document.fonts
    const editor = createFakeEditor()

    plugin.setup(editor, api)

    expect(editor.updateOptions).toHaveBeenCalledOnce()
    expect(api.editor.remeasureFonts).not.toHaveBeenCalled()
  })

  test('offers each font in the command palette, and saves the choice', () => {
    const editor = createFakeEditor()
    plugin.setup(editor, api)

    expect(editor.actions.map(({ label }) => label)).toEqual(
      editorFonts.map(({ label }) => `Police : ${label}`)
    )

    editor.actions.at(-1).run()
    expect(getPreferences('editor').fontFamily).toBe('jetbrains-mono')
    expect(editor.updateOptions).toHaveBeenLastCalledWith({
      fontFamily: jetbrainsMono.family,
    })
  })

  test('ignores the preferences that do not change the font', () => {
    const editor = createFakeEditor()
    plugin.setup(editor, api)

    setPreference('editor', 'zoomLevel', 3)

    expect(editor.updateOptions).toHaveBeenCalledOnce()
  })

  test('follows the font in a diff editor, without palette commands', () => {
    const diffEditor = { updateOptions: vi.fn() }
    const unfollow = followEditorFont(diffEditor, api)

    setPreference('editor', 'fontFamily', 'jetbrains-mono')
    unfollow()
    setPreference('editor', 'fontFamily', 'inter')

    expect(diffEditor.updateOptions.mock.calls).toEqual([
      [{ fontFamily: inter.family }],
      [{ fontFamily: jetbrainsMono.family }],
    ])
  })

  test('stops following the preferences once cleaned up', () => {
    const editor = createFakeEditor()
    const cleanup = plugin.setup(editor, api)

    cleanup()
    setPreference('editor', 'fontFamily', 'jetbrains-mono')

    expect(editor.updateOptions).toHaveBeenCalledOnce()
    for (const action of editor.actions) {
      expect(action.dispose).toHaveBeenCalledOnce()
    }
  })
})
