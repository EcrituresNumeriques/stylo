import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Search } from 'react-feather'

import Reference from './Reference'
import styles from './ReferenceList.module.scss'
import Field from '../Field'
import Button from "../Button";

function ReferenceList({ articleBibTeXEntries }) {
  // state showAll boolean (default false)
  const [filter, setFilter] = useState('')
  const [showAll, setShowAll] = useState(false)
  let bibTeXFound
  if (filter) {
    bibTeXFound = articleBibTeXEntries
      .filter((entry) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1)
      //.slice(0, 10)
  } else {
    if (showAll) {
      bibTeXFound = articleBibTeXEntries
    } else {
      bibTeXFound = articleBibTeXEntries.slice(0, 25)
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
      {!showAll && <Button className={styles.showAll} onClick={(e) => setShowAll(true)}>Show all {articleBibTeXEntries.length} references</Button>}
    </>
  )
}

const mapStateToProps = ({ articleBibTeXEntries }) => {
  return { articleBibTeXEntries }
}

const ConnectedReferenceList = connect(mapStateToProps)(ReferenceList)
export default ConnectedReferenceList
