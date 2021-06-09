import React, { useCallback, useRef, useState } from 'react'
import { HelpCircle, Plus } from 'react-feather'

import styles from './Citation.module.scss'
import Button from '../Button'
import Editor from "@monaco-editor/react";
import debounce from "lodash/debounce";
import { validate } from "../../helpers/bibtex";

export default function CreateCitation ({ onCreate }) {
  const citationForm = useRef()
  const [addCitation, setAddCitation] = useState('')
  const [citationValidationResult, setCitationValidationResult] = useState({
    valid: false
  })

  const validateCitation = (bibTeX, setCitationValidationResult, next) => {
    next(bibTeX)

    validate(bibTeX).then((result) => {
      if (result.warnings.length || result.errors.length) {
        setCitationValidationResult({
          valid: false,
          messages: [...result.errors, ...result.warnings],
          empty: result.empty
        })
      } else {
        setCitationValidationResult({
          valid: result.empty || result.success !== 0,
          empty: result.empty
        })
      }
    })
  }

  const monacoRef = useRef(null)

  function handleEditorDidMount (editor, monaco) {
    // here is another way to get monaco instance
    // you can also store it in `useRef` for further usage
    monacoRef.current = editor;
  }


  const delayedValidateCitation = useCallback(debounce(
    (bibTeX, setCitationValidationResult, next) =>
      validateCitation(bibTeX, setCitationValidationResult, next),
    1000
  ), [])

  return (<form
    ref={citationForm}
    onSubmit={(event) => event.preventDefault()}
    className={styles.citations}
  >
    <p className={styles.help}><HelpCircle size={14}/> Paste here the BibTeX of the citation you want to add</p>
    <div className={styles.citationEditor}>
      <Editor
        height="210px"
        defaultLanguage="plaintext"
        onChange={(value) => {
          setCitationValidationResult({
            valid: false
          })
          delayedValidateCitation(
            value,
            setCitationValidationResult,
            setAddCitation
          )
        }}
        options={{
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false
          }
        }}
        onMount={handleEditorDidMount}
      />
    </div>
    {citationValidationResult.messages && (
      <ul className={styles.citationMessages}>
        {citationValidationResult.messages.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
    )}
    <ul className={styles.actions}>
      <li className={styles.actionsSubmit}>
        <Button primary={true}
                type="submit"
                disabled={citationValidationResult.valid !== true || citationValidationResult.empty}
                onClick={() => {
                  onCreate(addCitation, citationForm)
                  monacoRef.current.getModel().setValue('')
                }}>
          <Plus/> Add
        </Button>
      </li>
    </ul>
  </form>)
}
