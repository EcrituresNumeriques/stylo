import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import debounce from 'lodash.debounce'
import { getValidationResults } from '../../../helpers/bibtex.js'

import { Check } from 'react-feather'

import MonacoBibtexEditor from '../providers/monaco/BibtexEditor'
import Button from '../../Button'

import styles from './bibliographe.module.scss'

export default function RawBibtexPanel({ onChange }) {
  const workingArticleBibliography = useSelector(
    (state) => state.workingArticle.bibliography,
    shallowEqual
  )
  const [bib, setBib] = useState(workingArticleBibliography.text)
  const [citationValidationResult, setCitationValidationResult] = useState({
    valid: false,
  })

  const isValid = useMemo(
    () => citationValidationResult.valid,
    [citationValidationResult.valid]
  )
  const handleTextUpdate = useCallback(
    debounce((bibtex) => {
      setBib(bibtex)
      getValidationResults(bibtex).then(setCitationValidationResult)
    }, 700),
    []
  )

  const handleFormSubmit = useCallback(
    (event) => {
      event.preventDefault()
      onChange(bib)
    },
    [bib]
  )
  const { t } = useTranslation()

  return (
    <form onSubmit={handleFormSubmit}>
      <div className={styles.raw}>
        <MonacoBibtexEditor text={bib} onTextUpdate={handleTextUpdate} />
      </div>

      {citationValidationResult.messages && (
        <ul className={styles.citationMessages}>
          {citationValidationResult.messages.map((m, i) => (
            <li key={m + i}>{m}</li>
          ))}
        </ul>
      )}

      <ul className={styles.actions}>
        <li className={styles.actionsSubmit}>
          <Button primary={true} disabled={!isValid} className={styles.primary}>
            <Check /> {t('writeBibliographe.buttonSave.rawPanel')}
          </Button>
        </li>
      </ul>
    </form>
  )
}
