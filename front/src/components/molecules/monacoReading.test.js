import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getPreferences, setPreference } from '../../helpers/preferences.js'
import { editorFonts } from '../organisms/monaco/fonts.js'
import { lineWidths } from '../organisms/monaco/lineWidths.js'
import readingPreferences, { followEditorFont } from './monacoReading.js'

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

/** the options given to the editor, filtered by one of their keys */
const optionsWith = (editor, key) =>
  editor.updateOptions.mock.calls
    .map(([options]) => options)
    .filter((options) => key in options)

const api = { editor: { remeasureFonts: vi.fn() } }
const plugin = readingPreferences({
  fontAction: (font) => `Police : ${font}`,
  lineWidthAction: (lineWidth) => `Largeur : ${lineWidth ?? 'toute'}`,
})
const [jetbrainsMono] = editorFonts
const inter = editorFonts.find(({ id }) => id === 'inter')

describe('readingPreferences', () => {
  let load

  beforeEach(() => {
    vi.clearAllMocks()
    setPreference('editor', 'fontFamily', 'inter')
    setPreference('editor', 'lineWidth', 80)
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
    const editor = createFakeEditor()

    plugin.setup(editor, api)
    await Promise.resolve()

    expect(optionsWith(editor, 'fontFamily')).toEqual([
      { fontFamily: inter.family },
    ])
    expect(load).toHaveBeenCalledWith(`1em ${inter.family}`)
    expect(api.editor.remeasureFonts).toHaveBeenCalledOnce()
  })

  test('falls back to JetBrains Mono for an unknown font', () => {
    setPreference('editor', 'fontFamily', 'comic-sans')
    const editor = createFakeEditor()

    plugin.setup(editor, api)

    expect(optionsWith(editor, 'fontFamily')).toEqual([
      { fontFamily: jetbrainsMono.family },
    ])
  })

  test('applies the font without remeasuring when the browser cannot tell', () => {
    delete document.fonts
    const editor = createFakeEditor()

    plugin.setup(editor, api)

    expect(optionsWith(editor, 'fontFamily')).toHaveLength(1)
    expect(api.editor.remeasureFonts).not.toHaveBeenCalled()
  })

  test('wraps the lines at the saved width, or at full width', () => {
    const editor = createFakeEditor()
    plugin.setup(editor, api)

    setPreference('editor', 'lineWidth', null)

    expect(optionsWith(editor, 'wordWrap')).toEqual([
      { wordWrap: 'bounded', wordWrapColumn: 80, wordWrapIndicator: true },
      { wordWrap: 'on', wordWrapIndicator: false },
    ])
  })

  test('falls back to 80 characters for an unknown width', () => {
    setPreference('editor', 'lineWidth', 42)
    const editor = createFakeEditor()

    plugin.setup(editor, api)

    expect(optionsWith(editor, 'wordWrap')).toEqual([
      { wordWrap: 'bounded', wordWrapColumn: 80, wordWrapIndicator: true },
    ])
  })

  test('offers each font and width in the command palette, and saves the choice', () => {
    const editor = createFakeEditor()
    plugin.setup(editor, api)

    expect(editor.actions.map(({ label }) => label)).toEqual([
      ...editorFonts.map(({ label }) => `Police : ${label}`),
      'Largeur : 80',
      'Largeur : 120',
      'Largeur : toute',
    ])

    editor.actions[0].run()
    editor.actions.at(-2).run()
    expect(getPreferences('editor')).toMatchObject({
      fontFamily: 'jetbrains-mono',
      lineWidth: lineWidths[1],
    })
    expect(editor.updateOptions).toHaveBeenCalledWith({
      fontFamily: jetbrainsMono.family,
    })
    expect(editor.updateOptions).toHaveBeenLastCalledWith({
      wordWrap: 'bounded',
      wordWrapColumn: 120,
      wordWrapIndicator: true,
    })
  })

  test('ignores the preferences that change neither the font nor the width', () => {
    const editor = createFakeEditor()
    plugin.setup(editor, api)

    setPreference('editor', 'zoomLevel', 3)

    expect(editor.updateOptions).toHaveBeenCalledTimes(2)
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
    setPreference('editor', 'lineWidth', null)

    expect(editor.updateOptions).toHaveBeenCalledTimes(2)
    for (const action of editor.actions) {
      expect(action.dispose).toHaveBeenCalledOnce()
    }
  })
})
