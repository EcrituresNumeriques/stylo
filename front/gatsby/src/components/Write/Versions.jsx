import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { ChevronDown, ChevronRight } from 'react-feather'

import styles from './versions.module.scss'
import menuStyles from './menu.module.scss'
import buttonStyles from '../button.module.scss'

import {generateArticleExportId} from '../../helpers/identifier'

import Modal from '../Modal'
import Export from '../Export'
import Button from '../Button'

const date = new Intl.DateTimeFormat(['en', 'fr'], {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'UTC',
  timeZoneName: 'short',
})

const dateFormat = date.format.bind(date)

const mapStateToProps = ({ articleVersions }) => {
  return { articleVersions }
}

const Versions = ({ article, articleVersions, selectedVersion, compareTo }) => {
  const [message, setMessage] = useState('')
  const [expand, setExpand] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportParams, setExportParams] = useState({ })

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <h1
        className={expand ? null : styles.closed}
        onClick={() => setExpand(!expand)}
      >
        {expand ? <ChevronDown/> : <ChevronRight/>}  Versions
      </h1>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export {...exportParams} />
        </Modal>
      )}
      {expand && (
        <>
          <ul className={styles.versionsList}>
            {articleVersions.map((v) => (
              <li
                key={`showVersion-${v._id}`}
                className={
                  v._id === selectedVersion
                    ? styles.selected
                    : v._id === compareTo
                    ? styles.compareTo
                    : null
                }
              >
                <Link to={`/article/${article._id}/version/${v._id}`}>
                  {v.message ? v.message : 'No label'}
                  ({v.version}.{v.revision})
                </Link>
                <p>
                  {v.owner && (
                    <span>
                      by <strong>{v.owner.displayName}</strong>{' '}
                    </span>
                  )}
                  {<span>on <time dateTime={v.updatedAt}>{dateFormat(new Date(v.updatedAt))}</time></span>}
                </p>
                <ul className={styles.actions}>
                  {v._id !== compareTo && (
                    <li>
                      <Link
                        className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                        to={`/article/${article._id}/${
                          selectedVersion
                            ? 'version/' + selectedVersion + '/'
                            : ''
                        }compare/${v._id}`}
                      >
                        Compare
                      </Link>
                    </li>
                  )}
                  {v._id === compareTo && (
                    <li>
                      <Link
                        className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                        to={`/article/${article._id}/${
                          selectedVersion
                            ? 'version/' + selectedVersion
                            : ''
                        }`}
                      >
                        Stop
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to={`/article/${article._id}/version/${v._id}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                    >
                      Preview
                    </Link>
                  </li>
                  <li>
                    <Button
                      onClick={() => {
                        setExportParams({
                          exportId: generateArticleExportId(article.title, v.version, v.revision),
                          articleVersionId: v._id
                        })
                        setExporting(true)
                      }}
                    >
                      Export
                    </Button>
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default connect(mapStateToProps)(Versions)
