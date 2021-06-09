import React, { useState, useEffect } from 'react'
import { Check, Shield } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'

import styles from './Citation.module.scss'
import Button from '../Button'
import { validate } from "../../helpers/bibtex";
import Editor from "@monaco-editor/react";


export default function EditRawCitation ({ onSave }) {
  const { articleBib, articleBibValidationResult, articleBibValidationStatus } = useSelector(state => ({
    articleBib: state.articleBib,
    articleBibValidationResult: state.articleBibValidationResult,
    articleBibValidationStatus: state.articleBibValidationStatus
  }))
  const articleBibValidationResultErrors = articleBibValidationResult.errors || []
  const articleBibValidationResultWarnings = articleBibValidationResult.warnings || []
  const articleBibValidationResultMessages = [...articleBibValidationResultErrors, ...articleBibValidationResultWarnings]
  const [bibTeX, setBibTeX] = useState(articleBib)
  const [isDirty, setDirty] = useState(false)
  const dispatch = useDispatch()
  const [rawBibTeXValidationResult, setRawBibTeXValidationResult] = useState({
    valid: false,
  })
  const validateCitation = () => {
    dispatch({ type: 'SET_ARTICLE_BIB_VALIDATION_STATUS', articleBibValidationStatus: 'pending' })
  }
  useEffect(() => {
    if (articleBibValidationStatus === 'pending') {
      validate(bibTeX).then((articleBibValidationResult) => {
        dispatch({ type: 'SET_ARTICLE_BIB_VALIDATION_RESULT', articleBibValidationResult })
      })
    }
  })

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className={styles.citationEditor}>
          {<Editor
            height="50vh"
            defaultLanguage="plaintext"
            defaultValue={bibTeX}
            options={{
              scrollBeyondLastLine: false,
              minimap: {
                enabled: false
              }
            }}
          />}
        </div>
        {articleBibValidationResultMessages && (
          <ul className={styles.citationMessages}>
            {articleBibValidationResultMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </form>
      <ul className={styles.footerActions}>
        <li className={styles.actionsSubmit}>
          <Button primary={true}
                  onClick={() => validateCitation()}
                  className={styles.secondary}
                  disabled={articleBibValidationStatus === 'pending'}>
            <Shield/> Validate
          </Button>
          <Button primary={true}
                  disabled={articleBibValidationResult.valid !== true}
                  onClick={onSave}
                  className={styles.primary}>
            <Check/> Save
          </Button>
        </li>
      </ul>
    </>
  )
}
