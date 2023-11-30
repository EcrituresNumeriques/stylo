import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
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

function Version ({ articleId, compareTo, readOnly, selectedVersion, v }) {
  const { t } = useTranslation()
  const className = clsx({
    [styles.selected]: v._id === selectedVersion,
    [styles.compareTo]: v._id === compareTo
  })

  const articleVersionId = v._id
  const versionPart = selectedVersion ? `version/${selectedVersion}/` : ''
  const compareLink = `/article/${articleId}/${versionPart}compare/${v._id}`

  const runQuery = useGraphQL()
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(v.message)
  const versionType = v.type || 'userAction'
  const manualVersion = versionType === 'userAction'
  const startRenaming = useCallback((event) => event.preventDefault() || setRenaming(true), [])
  const cancelRenaming = useCallback(() => setTitle(v.message) || setRenaming(false), [])

  const handleRename = useCallback(async (event) => {
    event.preventDefault()
    const variables = { version: articleVersionId, name: title }
    await runQuery({ query: renameVersion, variables })
    setTitle(title)
    setRenaming(false)
  }, [title])

  return <li
    className={clsx(className, styles.version, manualVersion ? styles.manualVersion : styles.automaticVersion)}>
    {renaming && (
      <form className={styles.renamingForm} onSubmit={handleRename}>
        <Field autoFocus={true} type="text" value={title} onChange={(event) => setTitle(event.target.value)}
               placeholder={'Label of the version'}/>
        <div className={styles.actions}>
          <Button title="Save" primary={true}>
            <Check/> Save
          </Button>
          <Button title="Cancel" type="button" onClick={cancelRenaming}>
            Cancel
          </Button>
        </div>
      </form>
    )}
    <Link to={`/article/${articleId}/version/${v._id}`} className={clsx(styles.versionLink, selectedVersion && styles.versionLinkCompare)}>
      {!renaming && versionType === 'editingSessionEnded' && <header>
        {t('version.editingSessionEnded.text')}
      </header>}

      {!renaming && versionType === 'collaborativeSessionEnded' && <header>
        {t('version.collaborativeSessionEnded.text')}
      </header>}

      {!renaming && versionType === 'userAction' && <header>
        <span className={styles.versionLabel}>
          v{v.version}.{v.revision}{' '}{title || ''}
        </span>
        {!readOnly && <Button title="Edit" icon={true} className={styles.editTitleButton} onClick={startRenaming}>
          <Edit3 size="20"/>
        </Button>}
      </header>}

      {!renaming && <p>
        {v.owner && (
          <span className={styles.author}>
            {t('article.by.text', {owner: v.owner.displayName || v.owner.username})}
          </span>
        )}
        <span className={styles.momentsAgo}>
         <TimeAgo date={v.updatedAt}/>
      </span>
      </p>}
    </Link>
    {!renaming && selectedVersion && <ul className={styles.actions}>
      {![compareTo, selectedVersion].includes(v._id) && (
        <li>
          <Link
            className={clsx(buttonStyles.button, buttonStyles.secondary, styles.action)}
            to={compareLink}
          >
            Compare
          </Link>
        </li>
      )}
      {v._id === compareTo && (
        <li>
          <Link
            className={clsx(buttonStyles.button, buttonStyles.secondary, styles.action)}
            to={`/article/${articleId}/${versionPart}`}
          >
            Stop
          </Link>
        </li>
      )}
    </ul>}
  </li>
}

Version.propTypes = {
  articleId: PropTypes.string.isRequired,
  v: PropTypes.object.isRequired,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  readOnly: PropTypes.bool,
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
  const cancelExport = useCallback(() => setExportParams({}), [])

  return (
    <section className={clsx(menuStyles.section)}>
      <h1 className={expand ? null : styles.closed} onClick={toggleExpand}>
        {expand ? <ChevronDown/> : <ChevronRight/>}
        Versions

        {!readOnly && <Button className={styles.headingAction} small={true} disabled={readOnly} onClick={createNewVersion}>
          New Version
        </Button>}
        {readOnly && <Link className={clsx(buttonStyles.button, buttonStyles.secondary, styles.editMode, styles.headingAction)} to={`/article/${article._id}`}> <ArrowLeft/> Edit Mode</Link>}
      </h1>
      {exportParams.articleId && (
        <Modal title="Export" cancel={cancelExport}>
          <Export {...exportParams} />
        </Modal>
      )}
      {expand && (
        <>
          {expandCreateForm && <CreateVersion articleId={article._id} readOnly={readOnly} onClose={closeNewVersion}/>}

          {articleVersions.length === 0 && (<p>
            <strong>All changes are automatically saved.</strong><br/>
            Create a new version to keep track of particular changes.
          </p>)}

          <ul className={styles.versionsList}>
            {articleVersions.map((v) => (
              <Version key={`showVersion-${v._id}`}
                       articleId={article._id}
                       selectedVersion={selectedVersion}
                       compareTo={compareTo}
                       readOnly={readOnly}
                       v={v}/>
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
