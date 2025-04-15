import * as monaco from 'monaco-editor'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import useBibliography, {
  validationResultInitialState,
} from '../../hooks/bibliography.js'

import MonacoBibtexEditor from '../Write/providers/monaco/BibtexEditor.jsx'
import BibliographyBibtexValidationStatus from './BibliographyBibtexValidationStatus.jsx'

import styles from './BibliographyBibtexEditor.module.scss'

export default function BibliographyBibtexEditor({
  initialValue,
  onChange,
  readOnly,
  editorHeight = 'calc(100vh - 350px)',
}) {
  const { updateText, errors, warnings, isLoading, references } =
    useBibliography({ initialText: initialValue })
  const { t } = useTranslation()
  const editorRef = useRef(null)
  const [text, setText] = useState(initialValue)
  const [errorDecorations, setErrorDecorations] = useState()
  const [warningDecorations, setWarningDecorations] = useState()
  const handleTextUpdate = useCallback(async (bibtex) => {
    setText(bibtex)
    onChange(validationResultInitialState(bibtex))
    await updateText(bibtex, (result) => {
      onChange(result)
    })
  }, [])

  useEffect(() => {
    if (editorRef.current) {
      if (errorDecorations) {
        errorDecorations.clear()
      }
      if (warningDecorations) {
        warningDecorations.clear()
      }
      if (errors.length > 0) {
        setErrorDecorations(
          editorRef.current.createDecorationsCollection(
            errors.map((error) => ({
              range: new monaco.Range(error.line, 1, error.line, 1),
              options: {
                glyphMarginHoverMessage: {
                  value: t(`biblatexparser.error.${error.type}`, error),
                },
                isWholeLine: true,
                className: 'error',
                glyphMarginClassName: 'error',
                zIndex: 999,
                showIfCollapsed: true,
              },
            }))
          )
        )
      }
      if (warnings.length > 0) {
        setWarningDecorations(
          editorRef.current.createDecorationsCollection(
            warnings.map((warning) => ({
              range: new monaco.Range(warning.line, 1, warning.line, 1),
              options: {
                glyphMarginHoverMessage: {
                  value: t(`biblatexparser.warning.${warning.type}`, warning),
                },
                isWholeLine: true,
                className: 'warning',
                glyphMarginClassName: 'warning',
                zIndex: 998,
                showIfCollapsed: true,
              },
            }))
          )
        )
      }
    }
  }, [errors, warnings, editorRef])

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  return (
    <>
      <BibliographyBibtexValidationStatus
        isLoading={isLoading}
        errors={errors}
        warnings={warnings}
        references={references}
        readOnly={readOnly}
      />
      <div className={styles.editor}>
        <MonacoBibtexEditor
          text={text}
          readOnly={readOnly}
          onTextUpdate={handleTextUpdate}
          fontSize="14"
          height={editorHeight}
          onMount={handleEditorDidMount}
        />
      </div>
    </>
  )
}
