import { Search } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { toBibtex } from '../../helpers/bibtex.js'
import { useBibliographyActions } from '../../hooks/article.js'

import Button from '../Button.jsx'
import Field from '../Field.jsx'
import BibliographyReference from './BibliographyReference.jsx'

import styles from './BibliographyReferenceList.module.scss'

export default function BibliographyReferenceList({ bibliography, onUpdate }) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)

  const bibliographyEntries = bibliography.entries
  let bibTeXFound
  if (filter) {
    bibTeXFound = bibliographyEntries.filter(
      (entry) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1
    )
  } else {
    if (showAll) {
      bibTeXFound = bibliographyEntries
    } else {
      bibTeXFound = bibliographyEntries.slice(0, 25)
    }
  }
  const handleShowAll = useCallback(() => setShowAll(true), [])

  const handleRemove = useCallback(
    (indexToRemove) => {
      const newBibTeXEntries = [
        ...bibliographyEntries.slice(0, indexToRemove),
        ...bibliographyEntries.slice(indexToRemove + 1),
      ]
      onUpdate(toBibtex(newBibTeXEntries.map(({ entry }) => entry)))
    },
    [bibliographyEntries]
  )

  return (
    <>
      <Field
        className={styles.searchField}
        type="text"
        icon={Search}
        value={filter}
        placeholder={t('write.searchFieldBiblio.placeholder')}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filter && (
        <span className={styles.resultFoundCount}>
          {bibTeXFound.length} found
        </span>
      )}
      {bibTeXFound.map((entry, index) => (
        <BibliographyReference
          key={`ref-${entry.key}-${index}`}
          entry={entry}
          onRemove={() => handleRemove(index)}
        />
      ))}
      {!showAll && bibliographyEntries.length > 25 && (
        <Button className={styles.showAll} onClick={handleShowAll}>
          {t('write.showBiblio.button', { length: bibliographyEntries.length })}
        </Button>
      )}
    </>
  )
}
