import { Clipboard, Search, Trash } from 'react-feather'
import React, { useState } from 'react'

import styles from './Citation.module.scss'
import CitationTypeIcon from './CitationTypeIcon'
import Button from '../Button'
import Field from '../Field'
import CopyToClipboard from 'react-copy-to-clipboard'

export default function ListCitation({ maxEntries = 10, className, bibTeXEntries, onRemove, canRemove = false, canCopy = false }) {
  const [filter, setFilter] = useState('')

  const bibTeXFound = bibTeXEntries
    .filter((entry) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1)

  return (
    <div className={className}>
      <Field className={styles.searchField} type="text" icon={Search} value={filter} placeholder="Search" onChange={(e) => setFilter(e.target.value)} />
      <div className={styles.responsiveTable}>
        <table className={styles.citationList}>
          <colgroup>
            <col className={styles.colIcon} />
            <col className={styles.colKey} />
            <col className={styles.colActions} />
          </colgroup>
          <tbody>
          {bibTeXEntries
            .map((entry, index) => ({ entry, index }))
            .filter(({ entry }) => entry.key.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            .slice(0, maxEntries)
            .map(({ entry, index }) => {
              return (
                <tr
                  key={`citation-${entry.key}-${index}`}
                  className={styles.citation}
                >
                  <td className={`icon-${entry.type} ${styles.colIcon}`}>
                    <CitationTypeIcon type={entry.type} />
                  </td>
                  <th className={styles.colKey} scope="row">
                    @{entry.key}
                  </th>
                  <td className={styles.colActions}>
                    {canCopy && <CopyToClipboard text={`[@${entry.key}]`}>
                      <Button title="Copy to clipboard" className={styles.copyToClipboard} icon={true}><Clipboard /></Button>
                    </CopyToClipboard>}
                    {canRemove && <Button icon={true} onClick={() => onRemove(index)}>
                      <Trash />
                    </Button>}
                  </td>
                </tr>
              )
            })
          }
          </tbody>
          {bibTeXFound.length > maxEntries && <tfoot>
          <tr className={styles.more}>
            <td></td>
            <td>{bibTeXFound.length - maxEntries} more &hellip;</td>
            <td></td>
          </tr>
          </tfoot>}
        </table>
      </div>
    </div>
  )
}
