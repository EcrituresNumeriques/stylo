import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, ChevronDown, ChevronRight } from 'react-feather'

import styles from './versions.module.scss'
import menuStyles from './menu.module.scss'
import buttonStyles from '../button.module.scss'

import { generateArticleExportId } from '../../helpers/identifier'

import Modal from '../Modal'
import Export from '../Export'
import Button from '../Button'
import CreateVersion from './CreateVersion'

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

export default function Versions ({ article, selectedVersion, compareTo, readOnly }) {
  const articleVersions = useSelector(state => state.articleVersions, shallowEqual)
  const expand = useSelector(state => state.articlePreferences.expandVersions)
  const dispatch = useDispatch()
  const [exportParams, setExportParams] = useState({})
  const [expandCreateForm, setExpandCreateForm] = useState(false)

  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandVersions' }), [])
  const closeNewVersion = useCallback(() => setExpandCreateForm(false), [])
  const createNewVersion = useCallback((event) => {
    event.preventDefault()
    dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandVersions', value: false })
    setExpandCreateForm(true)
  }, [])

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <h1
        className={expand ? null : styles.closed}
        onClick={toggleExpand}
      >
        {expand ? <ChevronDown/> : <ChevronRight/>}
        Versions

        <Button className={styles.newVersion} disabled={readOnly} onClick={createNewVersion}>
          New Version
        </Button>
      </h1>
      {exportParams.articleId && (
        <Modal title="Export" cancel={() => setExportParams({})}>
          <Export articleId={exportParams.articleId} articleVersionId={exportParams.articleVersionId} />
        </Modal>
      )}
      {expand && (
        <>
          {expandCreateForm && <CreateVersion articleId={article._id} readOnly={readOnly} onClose={closeNewVersion} />}

          {articleVersions.length === 0 && (<p>
            <strong>All changes are automatically saved.</strong><br/>
            You should create a new version to record a specific set of changes.
          </p>)}

          {readOnly && <Link className={[buttonStyles.button, buttonStyles.secondary, styles.editMode].join(' ')} to={`/article/${article._id}`}> <ArrowLeft/> Edit Mode</Link>}

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
                  {<span>on <time dateTime={v.updatedAt}>{dateFormat(v.updatedAt)}</time></span>}
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
                      to={`/article/${article._id}/version/${v._id}/annotate`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
                    >
                      Annotate
                    </Link>
                  </li>
                  <li>
                    <Button
                      onClick={() => {
                        setExportParams({
                          articleId: article._id,
                          articleVersionId: v._id
                        })
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
