import { Search, Trash } from 'react-feather'
import React, { useState } from 'react'
import { connect } from 'react-redux'

import styles from './bibliographe.module.scss'
import ReferenceTypeIcon from '../../ReferenceTypeIcon'
import Button from '../../Button'
import Field from '../../Field'

export default function CitationTable({ bibTeXEntries, onRemove }) {
  const [filter, setFilter] = useState('')

  const bibTeXFound = bibTeXEntries
    .filter((entry) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1)

  return (
    <>
      <Field className={styles.searchField} type="text" icon={Search} value={filter} placeholder="Search" onChange={(e) => setFilter(e.target.value)} />
      <p className={styles.resultFoundCount}>{bibTeXFound.length} found</p>

      <div className={styles.responsiveTable}>
        <table className={styles.citationList}>
          <colgroup>
            <col className={styles.colIcon} />
            <col className={styles.colKey} />
            <col className={styles.colActions} />
          </colgroup>
          <tbody>
          {bibTeXEntries
            .map((entry, index) => ({entry, index}))
            .filter(({ entry }) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            .slice(0, 10)
            .map(({ entry, index }) => {
              return (
                <tr
                  key={`citation-${entry.key}-${index}`}
                  className={styles.citation}
                >
                  <td className={`icon-${entry.type} ${styles.colIcon}`}>
                    <ReferenceTypeIcon type={entry.type} />
                  </td>
                  <th className={styles.colKey} scope="row">
                    @{entry.key}
                  </th>
                  <td className={styles.colActions}>
                    <Button icon={true} onClick={() => onRemove(index)}>
                      <Trash />
                    </Button>
                  </td>
                </tr>
              )
            })
          }
          {bibTeXFound.length > 10 && <tr className={styles.more}><td></td><td>&hellip;</td><td></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
