import React, { useCallback, useRef, useState } from 'react'
import { Check } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash/debounce'
import Editor from '@monaco-editor/react'

import styles from './Citation.module.scss'
import Button from '../Button'


export default function EditRawCitation ({ onSave }) {
  const articleBib = useSelector(state => state.articleBib)
  const [bibTeX, setBibTeX] = useState(articleBib)
  const [isDirty, setDirty] = useState(false)
  const dispatch = useDispatch()
  const [rawBibTeXValidationResult, setRawBibTeXValidationResult] = useState({
    valid: false,
  })
  const monacoRef = useRef(null)

  function handleEditorDidMount (editor, monaco) {
    // here is another way to get monaco instance
    // you can also store it in `useRef` for further usage
    monacoRef.current = editor;
  }

  const validateBibTeX = useCallback(debounce((bibTeX) => {
    dispatch({ type: 'VALIDATE_ARTICLE_BIB', bib: bibTeX })
  }, 1000), [])

  // TODO: add a validate button

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <Editor
          height="50vh"
          defaultLanguage="plaintext"
          defaultValue={bibTeX}
          onChange={(value) => validateBibTeX(value)}
          onMount={handleEditorDidMount}
          options={{
            minimap: {
              enabled: false
            }
          }}
        />

        {rawBibTeXValidationResult.messages && (
          <ul className={styles.citationMessages}>
            {rawBibTeXValidationResult.messages.map((message) => (
              <li>{message}</li>
            ))}
          </ul>
        )}
      </form>
      <ul className={styles.footerActions}>
        <li className={styles.actionsSubmit}>
          <Button primary={true}
                  disabled={rawBibTeXValidationResult.valid !== true}
                  onClick={onSave}
                  className={styles.primary}>
            <Check/> Save
          </Button>
        </li>
      </ul>
    </>
  )
}
