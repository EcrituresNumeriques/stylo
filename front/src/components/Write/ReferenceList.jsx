import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Search } from 'react-feather'

import Reference from './Reference'
import styles from './ReferenceList.module.scss'
import Field from '../Field'
import Button from "../Button";

function ReferenceList({ bibliography }) {
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)
  const bibliographyEntries = bibliography.entries
  let bibTeXFound
  if (filter) {
    bibTeXFound = bibliographyEntries
      .filter((entry) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1)
  } else {
    if (showAll) {
      bibTeXFound = bibliographyEntries
    } else {
      bibTeXFound = bibliographyEntries.slice(0, 25)
    }
  }
  return (
    <>
      <Field className={styles.searchField} type="text" icon={Search} value={filter} placeholder="Search" onChange={(e) => setFilter(e.target.value)} />
      {filter && <span className={styles.resultFoundCount}>{bibTeXFound.length} found</span>}
      {bibTeXFound
        .map((entry, index) => (
          <Reference key={`ref-${entry.key}-${index}`} entry={entry} />
        ))
      }
      {!showAll && bibliographyEntries.length > 25 && <Button className={styles.showAll} onClick={(e) => setShowAll(true)}>Show all {bibliographyEntries.length} references</Button>}
    </>
  )
}

const mapStateToProps = ({ workingArticle }) => {
  return { bibliography: workingArticle.bibliography }
}

const ConnectedReferenceList = connect(mapStateToProps)(ReferenceList)
export default ConnectedReferenceList
