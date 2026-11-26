import { describe, expect, test, vi } from 'vitest'
import { KeyCode } from './monaco.js'

import leaveEditor from './monacoLeaveEditor.js'

function createFakeEditor() {
  const listeners = { keyDown: [], blur: [] }
  const editor = {
    options: {},
    action: null,
    widget: null,
    addOverlayWidget: (widget) => (editor.widget = widget),
    removeOverlayWidget: vi.fn(),
    disposables: [],
    disposable: () => {
      const disposable = { dispose: vi.fn() }
      editor.disposables.push(disposable)
      return disposable
    },
    updateOptions: (options) => Object.assign(editor.options, options),
    addAction: (action) => {
      editor.action = action
      return editor.disposable()
    },
    onKeyDown: (listener) => {
      listeners.keyDown.push(listener)
      return editor.disposable()
    },
    onDidBlurEditorText: (listener) => {
      listeners.blur.push(listener)
      return editor.disposable()
    },
    keyDown: (keyCode) => {
      for (const listener of listeners.keyDown) listener({ keyCode })
    },
    blur: () => {
      for (const listener of listeners.blur) listener()
    },
    hint: () => editor.widget.getDomNode().textContent,
  }
  editor.cleanup = leaveEditor({
    action: () => 'Leave',
    hint: () => 'Press Tab to leave',
  }).setup(editor)
  return editor
}

describe('leaveEditor', () => {
  test('binds Escape only when Monaco has nothing to dismiss', () => {
    const editor = createFakeEditor()

    expect(editor.action.keybindings).toEqual([KeyCode.Escape])
    expect(editor.action.keybindingContext).toContain('!suggestWidgetVisible')
    expect(editor.action.keybindingContext).toContain('!findWidgetVisible')
    expect(editor.widget.getDomNode().getAttribute('role')).toBe('status')
  })

  test('Escape lets Tab move the focus and announces it', () => {
    const editor = createFakeEditor()

    editor.keyDown(KeyCode.Escape)
    editor.action.run()
    expect(editor.options.tabFocusMode).toBe(true)
    expect(editor.hint()).toBe('Press Tab to leave')

    editor.keyDown(KeyCode.Shift)
    editor.keyDown(KeyCode.Tab)
    expect(editor.options.tabFocusMode).toBe(true)

    editor.blur()
    expect(editor.options.tabFocusMode).toBe(false)
    expect(editor.hint()).toBe('')
  })

  test('any other key gives Tab back its indentation role', () => {
    const editor = createFakeEditor()

    editor.action.run()
    editor.keyDown(KeyCode.KeyA)
    expect(editor.options.tabFocusMode).toBe(false)
    expect(editor.hint()).toBe('')
  })

  test('cleans up the action, the listeners and the hint', () => {
    const editor = createFakeEditor()
    const hintWidget = editor.widget

    editor.cleanup()

    expect(editor.disposables).toHaveLength(3)
    for (const disposable of editor.disposables) {
      expect(disposable.dispose).toHaveBeenCalledOnce()
    }
    expect(editor.removeOverlayWidget).toHaveBeenCalledWith(hintWidget)
  })
})
