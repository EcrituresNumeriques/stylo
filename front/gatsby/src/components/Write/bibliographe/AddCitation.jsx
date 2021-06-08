import React, { useCallback, useRef, useState } from 'react'
import { Plus } from 'react-feather'

import styles from './bibliographe.module.scss'
import Button from '../../Button'
import delayedValidateCitation from './CitationValidation'

export default function AddCitation({ onAdd }) {
  const citationForm = useRef()
  const [addCitation, setAddCitation] = useState('')
  const [citationValidationResult, setCitationValidationResult] = useState({
    valid: false
  })
  const validateCitation = useCallback(delayedValidateCitation, [])

  return (<form
    ref={citationForm}
    onSubmit={(event) => event.preventDefault() && onAdd(addCitation, citationForm)}
    className={styles.citations}
  >
      <textarea
        onChange={(event) =>
          validateCitation(
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
          onClick={() => onAdd(addCitation, citationForm)}
        >
          <Plus /> Add
        </Button>
      </li>
    </ul>
  </form>)
}
