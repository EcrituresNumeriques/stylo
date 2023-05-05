import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { ArrowLeft, Check, ChevronDown, ChevronRight, Edit3 } from 'react-feather'
import TimeAgo from '../TimeAgo.jsx'

import styles from './versions.module.scss'
import menuStyles from './menu.module.scss'
import buttonStyles from '../button.module.scss'

import { useGraphQL } from '../../helpers/graphQL'
import { renameVersion } from './Write.graphql'

import Modal from '../Modal'
import Export from '../Export'
import Button from '../Button'
import Field from '../Field'
import CreateVersion from './CreateVersion'
import clsx from 'clsx'

function Version ({ articleId, articleName: name, compareTo, onExport, readOnly, selectedVersion, v }) {
  const className = clsx({
    [styles.selected]: v._id === selectedVersion,
    [styles.compareTo]: v._id === compareTo
  })

  const articleVersionId = v._id
  const versionPart = selectedVersion ? `version/${selectedVersion}/` : ''
  const compareLink  = `/article/${articleId}/${versionPart}compare/${v._id}`

  const runQuery = useGraphQL()
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(v.message)
  const setExportParams = useCallback(() => onExport({ articleId, articleVersionId, bib: v.bibPreview, name }), [])
  const startRenaming = useCallback((event) => event.preventDefault() || setRenaming(true), [])
  const cancelRenaming = useCallback(() => setTitle(v.message) || setRenaming(false), [])

  const handleRename = useCallback(async (event) => {
    event.preventDefault()
    const variables = { version: articleVersionId, name: title }
    await runQuery({ query: renameVersion, variables })
    setTitle(title)
    setRenaming(false)
  }, [title])

  return <li className={className}>
    {!renaming && <header>
      <Link to={`/article/${articleId}/version/${v._id}`}>
        <span className={styles.versionLabel}>{title || 'no label'}</span>
        <span className={styles.versionNumber}>v{v.version}.{v.revision}</span>
      </Link>

      {!readOnly && <Button title="Edit" icon={true} className={styles.editTitleButton} onClick={startRenaming}>
        <Edit3 size="20" />
      </Button>}
    </header>}

    {renaming && (
      <form className={styles.renamingForm} onSubmit={handleRename}>
        <Field autoFocus={true} type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
        <div className={styles.actions}>
          <Button title="Save" primary={true}>
            <Check /> Save
          </Button>
          <Button title="Cancel" type="button" onClick={cancelRenaming}>
            Cancel
          </Button>
        </div>
      </form>
    )}

    {!renaming && <p>
      {v.owner && (
        <span className={styles.author}>
          by <strong>{v.owner.displayName}</strong>
        </span>
      )}
      <span className={styles.momentsAgo}>
         <TimeAgo date={v.updatedAt} />
      </span>
    </p>}

    {!renaming && <ul className={styles.actions}>
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
          to={`/article/${articleId}/version/${v._id}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(buttonStyles.button, buttonStyles.secondary)}
        >
          Preview
        </Link>
      </li>
      <li>
        <Button onClick={setExportParams}>
          Export
        </Button>
      </li>
    </ul>}
  </li>
}

Version.propTypes = {
  articleId: PropTypes.string.isRequired,
  articleName: PropTypes.string.isRequired,
  v: PropTypes.object.isRequired,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  readOnly: PropTypes.bool,
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
  const handleVersionExport = useCallback(({ articleId, articleVersionId, bib, name }) => setExportParams({ articleId, articleVersionId, bib, name }), [])
  const cancelExport = useCallback(() => setExportParams({}), [])

  return (
    <section className={clsx(menuStyles.section)}>
      <h1 className={expand ? null : styles.closed} onClick={toggleExpand}>
        {expand ? <ChevronDown/> : <ChevronRight/>}
        Versions

        <Button className={styles.headingAction} small={true} disabled={readOnly} onClick={createNewVersion}>
          New Version
        </Button>
      </h1>
      {exportParams.articleId && (
        <Modal title="Export" cancel={cancelExport}>
          <Export {...exportParams} />
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
                articleName={article.title}
                selectedVersion={selectedVersion}
                compareTo={compareTo}
                onExport={handleVersionExport}
                readOnly={readOnly}
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
