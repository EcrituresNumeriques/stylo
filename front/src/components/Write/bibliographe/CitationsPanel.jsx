import React, { useCallback, useMemo, useRef, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import debounce from 'lodash.debounce'
import { Check, HelpCircle, Plus, Trash } from 'react-feather'
import { useToasts } from '@geist-ui/core'

import { toBibtex, toEntries, getValidationResults } from '../../../helpers/bibtex'

import MonacoBibtexEditor from '../providers/monaco/BibtexEditor'
import ReferenceTypeIcon from '../../ReferenceTypeIcon'
import Button from '../../Button'

import styles from './bibliographe.module.scss'

export default function CitationsPanel ({ onChange }) {
  const {setToast} = useToasts()
  const editorRef = useRef(null)
  const workingArticleBibliography = useSelector(state => state.workingArticle.bibliography, shallowEqual)
  const [bib, setBib] = useState(workingArticleBibliography.text)
  const [bibTeXEntries, setBibTeXEntries] = useState(workingArticleBibliography.entries)
  const [addCitation, setAddCitation] = useState('')
  const [citationValidationResult, setCitationValidationResult] = useState({ valid: false })

  const isValid = useMemo(() => citationValidationResult.valid, [citationValidationResult.valid])
  const isEmpty = useMemo(() => addCitation.trim().length === 0, [addCitation])
  const hasChanged = useMemo(() => bib !== workingArticleBibliography.text, [bib, workingArticleBibliography.text])

  // Merged citations are not yet saved
  const mergeCitations = useCallback(() => {
    setBib(addCitation + '\n' + bib)
    setBibTeXEntries([...toEntries(addCitation), ...bibTeXEntries])
    setAddCitation('')
    editorRef.current.setValue('')
  }, [addCitation, bib])

  const handleTextUpdate = useCallback(debounce((bibtex) => {
    setAddCitation(bibtex)
    getValidationResults(bibtex)
      .then((result) => setCitationValidationResult(result))
      .catch((err) => {
        setToast({
          type: 'error',
          text: `Unable to validate BibTex: ${err.toString()}`

        })
      })
  }, 700), [getValidationResults, setAddCitation])

  const handleRemove = useCallback((indexToRemove) => {
    const newBibTeXEntries = [...bibTeXEntries.slice(0, indexToRemove), ...bibTeXEntries.slice(indexToRemove + 1)];
    setBibTeXEntries(newBibTeXEntries)
    setBib(toBibtex(newBibTeXEntries.map(({ entry }) => entry)))
  }, [bibTeXEntries])

  const handleChanges = useCallback(() => onChange(bib), [bib])

  return (<div className={styles.citations}>
    <section className={styles.section}>
      <MonacoBibtexEditor
        height="150px"
        text={addCitation}
        ref={editorRef}
        onTextUpdate={handleTextUpdate}
      />
      {citationValidationResult.messages && (
        <ul className={styles.citationMessages}>
          {citationValidationResult.messages.map((m, i) => (
            <li key={m + i}>{m}</li>
          ))}
        </ul>
      )}
      <ul className={styles.actions}>
        <li className={styles.actionsHelp}>
          <HelpCircle />
          Paste BibTeX above for syntax validation.
        </li>
        <li className={styles.actionsSubmit}>
          <Button
            primary={true}
            type="submit"
            disabled={!isValid || isEmpty}
            onClick={mergeCitations}
          >
            <Plus/> Add references
          </Button>
        </li>
      </ul>
    </section>

    <section className={styles.section}>
      <h3>{bibTeXEntries.length} citations</h3>

      <div className={styles.responsiveTable}>
        <table className={styles.citationList}>
          <colgroup>
            <col className={styles.colIcon}/>
            <col className={styles.colKey}/>
            <col className={styles.colActions}/>
          </colgroup>
          <tbody>
          {bibTeXEntries.map((b, index) => (
            <tr
              key={`citation-${b.key}-${index}`}
              className={styles.citation}
            >
              <td className={`icon-${b.type} ${styles.colIcon}`}>
                <ReferenceTypeIcon type={b.type}/>
              </td>
              <th className={styles.colKey} scope="row">
                @{b.key}
              </th>
              <td className={styles.colActions}>
                <Button icon={true} onClick={() => handleRemove(index)} aria-label={`Remove reference ${b.key}`}>
                  <Trash/>
                </Button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      <ul className={styles.actions}>
        <li className={styles.actionsSubmit}>
          <Button primary={true} onClick={handleChanges} className={styles.primary} disabled={!hasChanged}>
            <Check /> Save changes
          </Button>
        </li>
      </ul>
    </section>
  </div>)
}
