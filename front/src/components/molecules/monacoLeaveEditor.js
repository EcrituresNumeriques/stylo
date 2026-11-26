/**
 * @import { editor } from 'monaco-editor/editor'
 */
import { KeyCode, OverlayWidgetPositionPreference } from './monaco.js'

/**
 * Escape is only handled when Monaco has nothing to dismiss: otherwise it
 * closes the suggestions, the find widget, the hover, collapses the selection…
 */
const NOTHING_TO_DISMISS = [
  'editorTextFocus',
  '!suggestWidgetVisible',
  '!findWidgetVisible',
  '!parameterHintsVisible',
  '!editorHoverVisible',
  '!editorHasSelection',
  '!editorHasMultipleSelections',
  '!inSnippetMode',
  '!renameInputVisible',
  '!markersNavigationVisible',
  '!inlineSuggestionVisible',
].join(' && ')

/**
 * Tab inserts a tabulation in the editor, so the keyboard focus can't leave it.
 * Pressing Escape then Tab (or Shift+Tab) moves the focus out of the editor:
 * Escape turns on Monaco's "tab focus mode" for the next key press only.
 * @param {editor.IStandaloneCodeEditor} editor
 * @param {object} labels
 * @param {() => string} labels.action - command palette entry
 * @param {() => string} labels.hint - shown and announced after Escape
 * @param {string} [labels.hintClassName]
 */
export function registerLeaveEditor(editor, { action, hint, hintClassName }) {
  const hintNode = document.createElement('div')
  hintNode.setAttribute('role', 'status')
  if (hintClassName) {
    hintNode.className = hintClassName
  }
  const hintWidget = {
    getId: () => 'stylo.leaveEditor.hint',
    getDomNode: () => hintNode,
    getPosition: () => ({
      preference: OverlayWidgetPositionPreference.TOP_RIGHT_CORNER,
    }),
  }
  editor.addOverlayWidget(hintWidget)

  let armed = false
  const setArmed = (value) => {
    if (armed === value) {
      return
    }
    armed = value
    editor.updateOptions({ tabFocusMode: value })
    hintNode.textContent = value ? hint() : ''
  }

  // addAction (unlike addCommand) scopes the keybinding to this editor
  const actionDisposable = editor.addAction({
    id: 'stylo.leaveEditor',
    label: action(),
    keybindings: [KeyCode.Escape],
    keybindingContext: NOTHING_TO_DISMISS,
    run: () => setArmed(true),
  })

  const keepsArmed = new Set([KeyCode.Tab, KeyCode.Shift, KeyCode.Escape])
  const keyDownDisposable = editor.onKeyDown((event) => {
    if (!keepsArmed.has(event.keyCode)) {
      setArmed(false)
    }
  })
  const blurDisposable = editor.onDidBlurEditorText(() => setArmed(false))

  editor.onDidDispose(() => {
    actionDisposable.dispose()
    keyDownDisposable.dispose()
    blurDisposable.dispose()
    editor.removeOverlayWidget(hintWidget)
  })
}
