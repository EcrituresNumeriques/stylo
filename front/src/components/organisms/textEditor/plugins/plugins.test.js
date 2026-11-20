import { describe, expect, test, vi } from 'vitest'

import { SubmenuAction } from '../../../molecules/monaco.js'
import {
  bibliographyCompletion,
  contextActions,
  imageDrop,
  realtime,
  snippetCompletionProvider,
} from './index.js'

vi.mock('../../../molecules/monaco.js', async (importOriginal) => ({
  ...(await importOriginal()),
  monaco: { editor: { addKeybindingRule: vi.fn(), addCommand: vi.fn() } },
}))

const { MonacoBinding } = vi.hoisted(() => ({
  MonacoBinding: vi.fn(function MonacoBinding() {
    this.destroy = vi.fn()
  }),
}))
vi.mock('y-monaco', () => ({ MonacoBinding }))

describe('plugins', () => {
  test('contextActions adds the Stylo submenus and actions', () => {
    const onSave = vi.fn()
    const contextMenu = { _getMenuActions: () => ['cut'] }
    const editor = {
      getContribution: () => contextMenu,
      getModel: () => ({}),
      getId: () => 'editor-1',
      addAction: vi.fn(),
    }

    contextActions({ t: (key) => key, onSave }).setup(editor)

    const [cut, separator, metopes, markdown] = contextMenu._getMenuActions()
    expect(cut).toBe('cut')
    expect(separator.constructor.name).toBe('Separator')
    expect(metopes).toBeInstanceOf(SubmenuAction)
    expect([metopes.id, markdown.id]).toEqual([
      'stylo--metopes--root',
      'stylo--markdown--root',
    ])

    const actions = editor.addAction.mock.calls.map(([action]) => action)
    actions.find(({ id }) => id === 'stylo--save-version').run()
    expect(onSave).toHaveBeenCalledOnce()
  })

  test('realtime binds the model to the shared text, in LF', async () => {
    const [yText, awareness] = [{}, {}]
    const model = { setEOL: vi.fn() }
    const editor = { getModel: () => model }
    const monaco = { editor: { EndOfLineSequence: { LF: 0 } } }

    const cleanup = await realtime({ yText, awareness }).setup(editor, monaco)

    expect(model.setEOL).toHaveBeenCalledWith(0)
    expect(MonacoBinding).toHaveBeenCalledWith(
      yText,
      model,
      new Set([editor]),
      awareness
    )
    cleanup()
    expect(MonacoBinding.mock.instances[0].destroy).toHaveBeenCalledOnce()
  })

  test.each([
    [
      'bibliographyCompletion',
      (disposable) => bibliographyCompletion({ register: () => disposable }),
    ],
    ['imageDrop', () => imageDrop({ getContext: () => ({}) })],
  ])('%s is disposed with the editor', (_name, create) => {
    const disposable = { dispose: vi.fn() }
    const editor = { onDropIntoEditor: () => disposable }

    const cleanup = create(disposable).setup(editor, {})
    cleanup()

    expect(disposable.dispose).toHaveBeenCalledOnce()
  })

  test('snippetCompletionProvider suggests the actions of a namespace until disposed', () => {
    const disposable = { dispose: vi.fn() }
    const monaco = {
      languages: { registerCompletionItemProvider: vi.fn(() => disposable) },
    }
    const editor = { getId: () => 'editor-1' }

    const cleanup = snippetCompletionProvider({
      t: (key) => key,
      namespace: 'metopes',
      types: ['delimited-block'],
    }).setup(editor, monaco)

    expect(
      monaco.languages.registerCompletionItemProvider
    ).toHaveBeenCalledWith(
      'markdown',
      expect.objectContaining({ triggerCharacters: [':'] })
    )
    cleanup()
    expect(disposable.dispose).toHaveBeenCalledOnce()
  })
})
