import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { shallowEqual, useSelector } from 'react-redux'
import debounce from 'lodash.debounce'
import { Check, HelpCircle, Plus, Trash } from 'lucide-react'
import { useToasts } from '@geist-ui/core'

import {
  toBibtex,
  toEntries,
  getValidationResults,
} from '../../helpers/bibtex.js'

import MonacoBibtexEditor from '../Write/providers/monaco/BibtexEditor.jsx'
import ReferenceTypeIcon from '../ReferenceTypeIcon.jsx'
import Button from '../Button.jsx'

export default function CitationsPanel({ onChange }) {
  const { setToast } = useToasts()
  const editorRef = useRef(null)
  const workingArticleBibliography = useSelector(
    (state) => state.workingArticle.bibliography,
    shallowEqual
  )
  const [bib, setBib] = useState(workingArticleBibliography.text)
  const [bibTeXEntries, setBibTeXEntries] = useState(
    workingArticleBibliography.entries
  )
  const [addCitation, setAddCitation] = useState('')
  const [citationValidationResult, setCitationValidationResult] = useState({
    valid: false,
  })

  const isValid = useMemo(
    () => citationValidationResult.valid,
    [citationValidationResult.valid]
  )
  const isEmpty = useMemo(() => addCitation.trim().length === 0, [addCitation])
  const hasChanged = useMemo(
    () => bib !== workingArticleBibliography.text,
    [bib, workingArticleBibliography.text]
  )
  const { t } = useTranslation()

  // Merged citations are not yet saved
  const mergeCitations = useCallback(() => {
    setBib(addCitation + '\n' + bib)
    setBibTeXEntries([...toEntries(addCitation), ...bibTeXEntries])
    setAddCitation('')
    editorRef.current.setValue('')
  }, [addCitation, bib])

  const handleTextUpdate = useCallback(
    debounce((bibtex) => {
      setAddCitation(bibtex)
      getValidationResults(bibtex)
        .then((result) => setCitationValidationResult(result))
        .catch((err) => {
          setToast({
            type: 'error',
            text: `Unable to validate BibTex: ${err.toString()}`,
          })
        })
    }, 700),
    [getValidationResults, setAddCitation]
  )

  const handleRemove = useCallback(
    (indexToRemove) => {
      const newBibTeXEntries = [
        ...bibTeXEntries.slice(0, indexToRemove),
        ...bibTeXEntries.slice(indexToRemove + 1),
      ]
      setBibTeXEntries(newBibTeXEntries)
      setBib(toBibtex(newBibTeXEntries.map(({ entry }) => entry)))
    },
    [bibTeXEntries]
  )

  const handleChanges = useCallback(() => onChange(bib), [bib])

  return (
    <div className={}>
      <section className={}>
        <MonacoBibtexEditor
          height="150px"
          text={addCitation}
          ref={editorRef}
          onTextUpdate={handleTextUpdate}
        />
        {citationValidationResult.messages && (
          <ul className={}>
            {citationValidationResult.messages.map((m, i) => (
              <li key={m + i}>{m}</li>
            ))}
          </ul>
        )}
        <ul className={}>
          <li className={}>
            <HelpCircle />
            {t('writeBibliographe.tips.citationPanel')}
          </li>
          <li className={}>
            <Button
              primary={true}
              type="submit"
              disabled={!isValid || isEmpty}
              onClick={mergeCitations}
            >
              <Plus /> {t('writeBibliographe.addRefererences.citationPanel')}
            </Button>
          </li>
        </ul>
      </section>

      <section className={}>
        <h3>{bibTeXEntries.length} citations</h3>

        <div className={}>
          <table className={}>
            <colgroup>
              <col className={} />
              <col className={} />
              <col className={} />
            </colgroup>
            <tbody>
              {bibTeXEntries.map((b, index) => (
                <tr
                  key={`citation-${b.key}-${index}`}
                  className={}
                >
                  <td className={`icon-${b.type}`}>
                    <ReferenceTypeIcon type={b.type} />
                  </td>
                  <th className={} scope="row">
                    @{b.key}
                  </th>
                  <td className={}>
                    <Button
                      icon={true}
                      onClick={() => handleRemove(index)}
                      aria-label={`Remove reference ${b.key}`}
                    >
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={}>
          <li className={}>
            <Button
              primary={true}
              onClick={handleChanges}
              className={}
              disabled={!hasChanged}
            >
              <Check /> {t('writeBibliographe.buttonSave.citationPanel')}
            </Button>
          </li>
        </ul>
      </section>
    </div>
  )
}
