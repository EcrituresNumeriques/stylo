import { describe, expect, test, vi } from 'vitest'

import { SubmenuAction } from '../../../molecules/monaco.js'
import {
  bibliographyCompletion,
  contextActions,
  imageDrop,
  realtime,
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

const t = (key) => key

describe('contextActions', () => {
  test('adds the Stylo submenus after the Monaco actions', () => {
    const contextMenu = { _getMenuActions: () => ['cut', 'copy'] }
    const editor = {
      getContribution: vi.fn(() => contextMenu),
      getModel: () => ({}),
      getId: () => 'editor-1',
      addAction: vi.fn(),
    }

    contextActions({ t, onSave: vi.fn() }).setup(editor)

    expect(editor.getContribution).toHaveBeenCalledWith(
      'editor.contrib.contextmenu'
    )
    const [cut, copy, separator, metopes, markdown] =
      contextMenu._getMenuActions()
    expect([cut, copy]).toEqual(['cut', 'copy'])
    expect(separator.constructor.name).toBe('Separator')
    expect(metopes).toBeInstanceOf(SubmenuAction)
    expect(metopes.id).toBe('stylo--metopes--root')
    expect(markdown.id).toBe('stylo--markdown--root')
  })

  test('adds the actions to the command palette, with the save shortcut', () => {
    const onSave = vi.fn()
    const editor = {
      getContribution: () => ({ _getMenuActions: () => [] }),
      getModel: () => ({}),
      getId: () => 'editor-1',
      addAction: vi.fn(),
    }

    contextActions({ t, onSave }).setup(editor)

    const save = editor.addAction.mock.calls
      .map(([action]) => action)
      .find((action) => action.id === 'stylo--save-version')
    save.run()
    expect(onSave).toHaveBeenCalledOnce()
    expect(editor.addAction.mock.calls.length).toBeGreaterThan(2)
  })
})

describe('realtime', () => {
  test('binds the model to the shared text, in LF', async () => {
    const yText = {}
    const awareness = {}
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
    const binding = MonacoBinding.mock.instances[0]
    cleanup()
    expect(binding.destroy).toHaveBeenCalledOnce()
  })
})

describe('bibliographyCompletion', () => {
  test('registers the completion provider until the editor is gone', () => {
    const registration = { dispose: vi.fn() }
    const provider = { register: vi.fn(() => registration) }
    const monaco = {}
    const plugin = bibliographyCompletion(provider)

    const cleanup = plugin.setup({}, monaco)
    expect(provider.register).toHaveBeenCalledWith(monaco)

    cleanup()
    expect(registration.dispose).toHaveBeenCalledOnce()
  })
})

describe('imageDrop', () => {
  test('listens to the drops until the editor is gone', () => {
    const listener = { dispose: vi.fn() }
    const editor = { onDropIntoEditor: vi.fn(() => listener) }
    const plugin = imageDrop()

    const cleanup = plugin.setup(editor)
    expect(editor.onDropIntoEditor).toHaveBeenCalledWith(expect.any(Function))

    cleanup()
    expect(listener.dispose).toHaveBeenCalledOnce()
  })
})
