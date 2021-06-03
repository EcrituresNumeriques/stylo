import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Search } from 'react-feather'

import Reference from './Reference'
import styles from './ReferenceList.module.scss'
import Field from '../Field'

function ReferenceList({ articleBibTeXEntries }) {
  const [filter, setFilter] = useState('')

  const bibTeXFound = articleBibTeXEntries
    .filter((entry) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1)

  return (
    <>
      <Field className={styles.searchField} type="text" icon={Search} value={filter} placeholder="Search" onChange={(e) => setFilter(e.target.value)} />
      <span className={styles.resultFoundCount}>{bibTeXFound.length} found</span>
      {bibTeXFound
        .slice(0, 10)
        .map((entry, index) => (
          <Reference key={`ref-${entry.key}-${index}`} entry={entry} />
        ))
      }
      {bibTeXFound.length > 10 && <span className={styles.more}>&hellip;</span>}
    </>
  )
}

const mapStateToProps = ({ articleBibTeXEntries }) => {
  return { articleBibTeXEntries }
}

const ConnectedReferenceList = connect(mapStateToProps)(ReferenceList)
export default ConnectedReferenceList
