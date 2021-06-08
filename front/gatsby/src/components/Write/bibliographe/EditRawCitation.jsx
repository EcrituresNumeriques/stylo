import React, { useCallback, useState } from 'react'
import { Check } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash/debounce'
import Editor from '@monaco-editor/react'

import styles from './bibliographe.module.scss'
import Button from '../../Button'
import delayedValidateCitation from './CitationValidation'


export default function EditRawCitation({ onSave, onChange = () => {} }) {
  const articleBib = useSelector(state => state.articleBib)
  const [bibTeX, setBibTeX] = useState(articleBib)
  const [isDirty, setDirty] = useState(false)
  const dispatch = useDispatch()
  const [rawBibTeXValidationResult, setRawBibTeXValidationResult] = useState({
    valid: false,
  })
  /*
  const validateCitation = useCallback(delayedValidateCitation, [])
  const updateBibTeX = useCallback(debounce((bibTeX) => {
    dispatch({ type: 'UPDATE_ARTICLE_BIB', bib: bibTeX })
  }, []), 1000)
   */

  // TODO: add a validate button

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <Editor
          height="70vh"
          defaultLanguage="plaintext"
          defaultValue={bibTeX}
          onChange={() => setDirty(true)}
        />

        {rawBibTeXValidationResult.messages && (
          <ul className={styles.citationMessages}>
            {rawBibTeXValidationResult.messages.map((message) => (
              <li>{message}</li>
            ))}
          </ul>
        )}
      </form>
      <Button primary={true} disabled={rawBibTeXValidationResult.valid !== true} onClick={onSave} className={styles.primary}>
        <Check /> Save
      </Button>
    </>
  )
}
