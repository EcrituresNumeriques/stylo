import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, ChevronDown, ChevronRight } from 'react-feather'

import styles from './versions.module.scss'
import menuStyles from './menu.module.scss'
import buttonStyles from '../button.module.scss'

import Modal from '../Modal'
import Export from '../Export'
import Button from '../Button'
import CreateVersion from './CreateVersion'
import formatTimeAgo from '../../helpers/formatTimeAgo.js'
import clsx from 'clsx'

function Version ({ articleId, compareTo, onExport, selectedVersion, v }) {
  const className = clsx({
    [styles.selected]: v._id === selectedVersion,
    [styles.compareTo]: v._id === compareTo
  })

  const articleVersionId = v._id
  const versionPart = selectedVersion ? `version/${selectedVersion}/` : ''
  const compareLink  = `/article/${articleId}/${versionPart}compare/${v._id}`
  const setExportParams = useCallback(() => onExport({ articleId, articleVersionId }), [])

  return <li className={className}>
    <Link to={`/article/${articleId}/version/${v._id}`}>
      {v.message ? v.message : 'No label'}
      ({v.version}.{v.revision})
    </Link>
    <p>
      {v.owner && (
        <span>
          by <strong>{v.owner.displayName}</strong>{', '}
        </span>
      )}
      <span>
        <time dateTime={v.updatedAt}>{formatTimeAgo(v.updatedAt)}</time>
      </span>
    </p>
    <ul className={styles.actions}>
      {![compareTo, selectedVersion].includes(v._id) && (
        <li>
          <Link
            className={clsx(buttonStyles.button, buttonStyles.secondary)}
            to={compareLink}
          >
            Compare
          </Link>
        </li>
      )}
      {v._id === compareTo && (
        <li>
          <Link
            className={clsx(buttonStyles.button, buttonStyles.secondary)}
            to={`/article/${articleId}/${versionPart}`}
          >
            Stop
          </Link>
        </li>
      )}
      <li>
        <Link
          to={`/article/${articleId}/version/${v._id}/annotate`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(buttonStyles.button, buttonStyles.secondary)}
        >
          Annotate
        </Link>
      </li>
      <li>
        <Button onClick={setExportParams}>
          Export
        </Button>
      </li>
    </ul>
  </li>
}

Version.propTypes = {
  articleId: PropTypes.string.isRequired,
  v: PropTypes.object.isRequired,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  onExport: PropTypes.func.isRequired
}

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
  const handleVersionExport = useCallback(({ articleId, articleVersionId }) => setExportParams({ articleId, articleVersionId }), [])
  const cancelExport = useCallback(() => setExportParams({}), [])

  return (
    <section className={clsx(styles.section, menuStyles.section)}>
      <h1 className={expand ? null : styles.closed} onClick={toggleExpand}>
        {expand ? <ChevronDown/> : <ChevronRight/>}
        Versions

        <Button className={styles.newVersion} small={true} disabled={readOnly} onClick={createNewVersion}>
          New Version
        </Button>
      </h1>
      {exportParams.articleId && (
        <Modal title="Export" cancel={cancelExport}>
          <Export articleId={exportParams.articleId} articleVersionId={exportParams.articleVersionId} />
        </Modal>
      )}
      {expand && (
        <>
          {expandCreateForm && <CreateVersion articleId={article._id} readOnly={readOnly} onClose={closeNewVersion} />}

          {articleVersions.length === 0 && (<p>
            <strong>All changes are automatically saved.</strong><br/>
            Create a new version to keep track of particular changes.
          </p>)}

          {readOnly && <Link className={clsx(buttonStyles.button, buttonStyles.secondary, styles.editMode)} to={`/article/${article._id}`}> <ArrowLeft/> Edit Mode</Link>}

          <ul className={styles.versionsList}>
            {articleVersions.map((v) => (
              <Version key={`showVersion-${v._id}`}
                articleId={article._id}
                selectedVersion={selectedVersion}
                compareTo={compareTo}
                onExport={handleVersionExport}
                v={v} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

Versions.propTypes = {
  article: PropTypes.object.isRequired,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  readOnly: PropTypes.bool
}
