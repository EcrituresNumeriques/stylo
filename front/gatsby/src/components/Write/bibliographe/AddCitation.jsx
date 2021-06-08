import React, { useCallback, useRef, useState } from 'react'
import { Plus } from 'react-feather'

import styles from './bibliographe.module.scss'
import Button from '../../Button'
import debounce from 'lodash/debounce'
import { validate } from '../../../helpers/bibtex'

export default function AddCitation({ onAdd }) {
  const citationForm = useRef()
  const [addCitation, setAddCitation] = useState('')
  const [citationValidationResult, setCitationValidationResult] = useState({
    valid: false,
  })

  const delayedValidateCitation = useCallback(
    debounce(
      (bibtex, setCitationValidationResult, next) =>
        validateCitation(bibtex, setCitationValidationResult, next),
      1000
    ),
    []
  )

  const validateCitation = (bibtex, setCitationValidationResult, next) => {
    next(bibtex)

    validate(bibtex).then((result) => {
      if (result.warnings.length || result.errors.length) {
        setCitationValidationResult({
          valid: false,
          messages: [...result.errors, ...result.warnings],
        })
      } else {
        setCitationValidationResult({
          valid: result.empty || result.success !== 0,
        })
      }
    })
  }

  return (<form
    ref={citationForm}
    onSubmit={(e) => e.preventDefault() && onAdd(citationForm)}
    className={styles.citations}
  >
      <textarea
        onChange={(event) =>
          delayedValidateCitation(
            event.target.value,
            setCitationValidationResult,
            setAddCitation
          )
        }
        placeholder="Paste here the BibTeX of the citation you want to add"
      />
    {citationValidationResult.messages && (
      <ul className={styles.citationMessages}>
        {citationValidationResult.messages.map((message) => (
          <li>{message}</li>
        ))}
      </ul>
    )}
    <ul className={styles.actions}>
      <li className={styles.actionsSubmit}>
        <Button
          primary={true}
          type="submit"
          disabled={citationValidationResult.valid !== true}
          onClick={() => onAdd(citationForm)}
        >
          <Plus /> Add
        </Button>
      </li>
    </ul>
  </form>)
}
