import throttle from 'lodash.throttle'
import * as monaco from 'monaco-editor'
import { useCallback, useEffect, useRef, useState } from 'react'

import { compareDiagnostics, VALIDATORS } from '../helpers/validator/index.js'
import i18n from '../i18n.js'

const MARKER_OWNER = 'stylo-validator'

/**
 * @param {'error'|'warning'} severity
 * @returns {number}
 */
function toMonacoSeverity(severity) {
  return severity === 'error'
    ? monaco.MarkerSeverity.Error
    : monaco.MarkerSeverity.Warning
}

/**
 * Translate a diagnostic message from its i18n key and params.
 * @param {{ messageKey: string, messageParams?: object }} diagnostic
 * @returns {string}
 */
function translateMessage({ messageKey, messageParams }) {
  return i18n.t(messageKey, { ns: 'editor', ...messageParams })
}

/**
 * @param {import('react').RefObject} editorRef
 * @param {string[]} profiles - list of active validator profile ids (e.g. ['metopes'])
 * @param {import('../helpers/validator/index.js').ValidationContext} [context] - article data checked alongside the text (e.g. metadata)
 * @returns {{ validate: () => Promise<void>, diagnostics: Array, isValidating: boolean, clearDiagnostics: () => void }}
 */
export function useMarkdownValidator(
  editorRef,
  profiles = ['metopes'],
  context = {}
) {
  const [diagnostics, setDiagnostics] = useState([])
  const [isValidating, setIsValidating] = useState(false)
  const [hasValidated, setHasValidated] = useState(false)
  const profilesRef = useRef(profiles)
  profilesRef.current = profiles
  const contextRef = useRef(context)
  contextRef.current = context
  const hasValidatedRef = useRef(false)
  const decorationsRef = useRef(null)
  const subscriptionRef = useRef(null)

  const validate = useCallback(async () => {
    const editor = editorRef.current
    if (!editor) return

    const markdown = editor.getModel()?.getValue() ?? ''
    setIsValidating(true)

    try {
      const all = []
      for (const profileId of profilesRef.current) {
        const validator = VALIDATORS[profileId]
        if (validator) {
          const profileResults = await validator(markdown, contextRef.current)
          all.push(...profileResults)
        }
      }
      const results = all.sort(compareDiagnostics)
      // Metadata diagnostics have no position in the text
      const textResults = results.filter((d) => d.line)
      setDiagnostics(results)
      setHasValidated(true)
      hasValidatedRef.current = true

      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelMarkers(
          model,
          MARKER_OWNER,
          textResults.map((d) => ({
            startLineNumber: d.line,
            startColumn: d.column,
            endLineNumber: d.endLine,
            endColumn: d.endColumn,
            message: translateMessage(d),
            severity: toMonacoSeverity(d.severity),
            code: d.code,
          }))
        )
      }

      if (decorationsRef.current) {
        decorationsRef.current.clear()
      }
      decorationsRef.current = editor.createDecorationsCollection(
        textResults.map((d) => ({
          range: new monaco.Range(d.line, 1, d.endLine || d.line, 1),
          options: {
            linesDecorationsTooltip: translateMessage(d),
            linesDecorationsClassName:
              d.severity === 'error' ? 'validator-error' : 'validator-warning',
            isWholeLine: false,
            showIfCollapsed: true,
          },
        }))
      )

      // Subscribe to content changes for live re-validation after first run
      if (!subscriptionRef.current) {
        const throttledRevalidate = throttle(
          () => {
            if (hasValidatedRef.current) {
              validate()
            }
          },
          1000,
          { leading: false, trailing: true }
        )

        const disposable = editor.onDidChangeModelContent(() => {
          if (hasValidatedRef.current) {
            setIsValidating(true)
            throttledRevalidate()
          }
        })
        subscriptionRef.current = {
          disposable,
          cancel: throttledRevalidate.cancel,
        }

        editor.onDidDispose(() => {
          subscriptionRef.current?.disposable.dispose()
          subscriptionRef.current?.cancel()
          subscriptionRef.current = null
        })
      }
    } finally {
      setIsValidating(false)
    }
  }, [editorRef])

  // Re-validate when the metadata changes after a first run
  useEffect(() => {
    if (hasValidatedRef.current) {
      validate()
    }
  }, [context.metadata, validate])

  const clearDiagnostics = useCallback(() => {
    const editor = editorRef.current
    const model = editor?.getModel()
    if (model) {
      monaco.editor.setModelMarkers(model, MARKER_OWNER, [])
    }
    if (decorationsRef.current) {
      decorationsRef.current.clear()
      decorationsRef.current = null
    }
    if (subscriptionRef.current) {
      subscriptionRef.current.disposable.dispose()
      subscriptionRef.current.cancel()
      subscriptionRef.current = null
    }
    setDiagnostics([])
    setHasValidated(false)
    hasValidatedRef.current = false
  }, [editorRef])

  const navigateTo = useCallback(
    (line, column = 1) => {
      const editor = editorRef.current
      if (!editor) return
      const endColumn = editor.getModel()?.getLineMaxColumn(line) ?? column
      editor.focus()
      editor.setPosition({ lineNumber: line, column: endColumn })
      editor.revealLineNearTop(line, 1)
    },
    [editorRef]
  )

  return {
    validate,
    diagnostics,
    isValidating,
    hasValidated,
    clearDiagnostics,
    navigateTo,
  }
}
