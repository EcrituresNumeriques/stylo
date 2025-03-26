import React, { useCallback, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Reference from './Reference'
import styles from './ReferenceList.module.scss'
import Field from '../Field'
import Button from '../Button'

export default function ReferenceList() {
  const bibliographyEntries = useSelector(
    (state) => state.workingArticle.bibliography.entries,
    shallowEqual
  )
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)
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
  const { t } = useTranslation()
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
        <Reference key={`ref-${entry.key}-${index}`} entry={entry} />
      ))}
      {!showAll && bibliographyEntries.length > 25 && (
        <Button className={styles.showAll} onClick={handleShowAll}>
          {t('write.showBiblio.button', { length: bibliographyEntries.length })}
        </Button>
      )}
    </>
  )
}
