import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Edit3,
} from 'lucide-react'
import TimeAgo from '../TimeAgo.jsx'

import styles from './versions.module.scss'
import menuStyles from './menu.module.scss'
import buttonStyles from '../button.module.scss'

import { useGraphQLClient } from '../../helpers/graphQL'
import { renameVersion } from './Write.graphql'

import Button from '../Button'
import Field from '../Field'
import CreateVersion from './CreateVersion'
import clsx from 'clsx'

function Version({ articleId, compareTo, readOnly, selectedVersion, v }) {
  const { t } = useTranslation()

  const articleVersionId = v._id

  const isComparing = useMemo(
    () => compareTo || selectedVersion,
    [compareTo, selectedVersion]
  )
  const isSelected = useMemo(
    () => articleVersionId === selectedVersion,
    [articleVersionId, selectedVersion]
  )
  const versionPart = useMemo(
    () => (selectedVersion ? `version/${selectedVersion}/` : ''),
    [selectedVersion]
  )
  const compareLink = useMemo(
    () => `/article/${articleId}/${versionPart}compare/${articleVersionId}`,
    [articleId, versionPart, articleVersionId]
  )
  const canCompare = useMemo(
    () => ![compareTo, selectedVersion].includes(articleVersionId),
    [compareTo, selectedVersion, articleVersionId]
  )
  const canStopCompare = useMemo(
    () => isComparing && compareTo && articleVersionId === compareTo,
    [compareTo, articleVersionId]
  )

  const className = clsx({
    [styles.selected]: isSelected,
    [styles.compareTo]: isComparing && articleVersionId === compareTo,
  })

  const { query } = useGraphQLClient()
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(v.message)
  const versionType = v.type || 'userAction'
  const manualVersion = versionType === 'userAction'
  const startRenaming = useCallback(
    (event) => event.preventDefault() || setRenaming(true),
    []
  )
  const cancelRenaming = useCallback(
    () => setTitle(v.message) || setRenaming(false),
    []
  )

  const handleRename = useCallback(
    async (event) => {
      event.preventDefault()
      const variables = { version: articleVersionId, name: title }
      await query({ query: renameVersion, variables })
      setTitle(title)
      setRenaming(false)
    },
    [title]
  )

  return (
    <li
      aria-current={isSelected}
      className={clsx(
        className,
        styles.version,
        manualVersion ? styles.manualVersion : styles.automaticVersion
      )}
    >
      {renaming && (
        <form className={styles.renamingForm} onSubmit={handleRename}>
          <Field
            autoFocus={true}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={'Label of the version'}
          />
          <div className={styles.actions}>
            <Button
              title={t('write.saveVersionName.buttonTitle')}
              primary={true}
            >
              <Check /> {t('write.saveVersionName.buttonText')}
            </Button>
            <Button
              title={t('write.cancelVersionName.buttonTitle')}
              type="button"
              onClick={cancelRenaming}
            >
              {t('write.cancelVersionName.buttonText')}
            </Button>
          </div>
        </form>
      )}
      <Link
        to={`/article/${articleId}/version/${v._id}`}
        className={clsx(
          styles.versionLink,
          selectedVersion && styles.versionLinkCompare
        )}
      >
        {!renaming && versionType === 'editingSessionEnded' && (
          <header>{t('version.editingSessionEnded.text')}</header>
        )}

        {!renaming && versionType === 'collaborativeSessionEnded' && (
          <header>{t('version.collaborativeSessionEnded.text')}</header>
        )}

        {!renaming && versionType === 'userAction' && (
          <header>
            <span className={styles.versionLabel}>
              v{v.version}.{v.revision} {title || ''}
            </span>
            {!readOnly && (
              <Button
                title={t('write.editVersionName.buttonTitle')}
                icon={true}
                className={styles.editTitleButton}
                onClick={startRenaming}
              >
                <Edit3 size="20" />
              </Button>
            )}
          </header>
        )}

        {!renaming && (
          <p>
            {v.owner && (
              <span className={styles.author}>
                {t('version.by.text', {
                  owner: v.owner.displayName || v.owner.username,
                })}
              </span>
            )}
            <span className={styles.momentsAgo}>
              <TimeAgo date={v.updatedAt} />
            </span>
          </p>
        )}
      </Link>

      <ul className={styles.actions}>
        <li hidden={!canCompare}>
          <Link
            className={clsx(
              buttonStyles.button,
              buttonStyles.secondary,
              styles.action
            )}
            to={compareLink}
          >
            {t('write.compareVersion.button')}
          </Link>
        </li>
        <li hidden={!canStopCompare}>
          <Link
            className={clsx(
              buttonStyles.button,
              buttonStyles.secondary,
              styles.action
            )}
            to={`/article/${articleId}/${versionPart}`}
          >
            {t('write.stopCompareVersion.button')}
          </Link>
        </li>
      </ul>
    </li>
  )
}

Version.propTypes = {
  articleId: PropTypes.string.isRequired,
  v: PropTypes.object.isRequired,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  readOnly: PropTypes.bool,
}

export function WorkingVersion({
  articleId,
  selectedVersion = null,
  compareTo = null,
  readOnly,
}) {
  const updatedAt = useSelector((state) => state.workingArticle.updatedAt)
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const articleVersionId = null
  const isComparing = useMemo(() => pathname.includes('/compare'), [pathname])

  const isSelected = useMemo(
    () => articleVersionId === selectedVersion,
    [articleVersionId, selectedVersion]
  )
  const compareLink = useMemo(
    () =>
      selectedVersion
        ? `/article/${articleId}/version/${selectedVersion}/compare/working-copy`
        : `/article/${articleId}/compare/${selectedVersion}`,
    [articleId, selectedVersion, articleVersionId]
  )
  const canCompare = useMemo(
    () =>
      isComparing
        ? ![compareTo, selectedVersion].includes(articleVersionId)
        : selectedVersion,
    [isComparing, compareTo, selectedVersion, articleVersionId]
  )
  const canStopCompare = useMemo(
    () => isComparing && compareTo === articleVersionId,
    [isComparing, isSelected]
  )

  const className = clsx({
    [styles.selected]: isSelected,
    [styles.compareTo]: isComparing && articleVersionId === compareTo,
  })

  return (
    <li
      className={clsx(styles.version, className, styles.automaticVersion)}
      aria-current={isSelected}
    >
      <Link
        to={`/article/${articleId}`}
        className={clsx(
          styles.versionLink,
          selectedVersion && styles.versionLinkCompare
        )}
      >
        <header>
          <span className={styles.versionLabel}>
            {t('workingVersion.spanWorkingCopy.text')}
          </span>
        </header>

        <p>
          <span className={styles.momentsAgo}>
            <TimeAgo date={updatedAt} />
          </span>
        </p>
      </Link>

      <ul className={styles.actions}>
        <li hidden={!canCompare}>
          <Link
            className={clsx(
              buttonStyles.button,
              buttonStyles.secondary,
              styles.action
            )}
            to={compareLink}
          >
            {t('write.compareVersion.button')}
          </Link>
        </li>
        <li hidden={!canStopCompare}>
          <Link
            className={clsx(
              buttonStyles.button,
              buttonStyles.secondary,
              styles.action
            )}
            to={`/article/${articleId}`}
          >
            {t('write.stopCompareVersion.button')}
          </Link>
        </li>
      </ul>
    </li>
  )
}

WorkingVersion.propTypes = {
  articleId: PropTypes.string.isRequired,
  selectedVersion: PropTypes.string,
  compareTo: PropTypes.string,
  readOnly: PropTypes.bool,
}

export default function Versions({
  article,
  selectedVersion,
  compareTo,
  readOnly,
}) {
  const articleVersions = useSelector(
    (state) => state.articleVersions,
    shallowEqual
  )
  const expand = useSelector((state) => state.articlePreferences.expandVersions)
  const dispatch = useDispatch()
  const [expandCreateForm, setExpandCreateForm] = useState(false)

  const toggleExpand = useCallback(
    () =>
      dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandVersions' }),
    []
  )
  const closeNewVersion = useCallback(() => setExpandCreateForm(false), [])
  const createNewVersion = useCallback((event) => {
    event.preventDefault()
    dispatch({
      type: 'ARTICLE_PREFERENCES_TOGGLE',
      key: 'expandVersions',
      value: false,
    })
    setExpandCreateForm(true)
  }, [])
  const { t } = useTranslation()

  return (
    <section className={clsx(menuStyles.section)}>
      <h1 className={expand ? null : styles.closed} onClick={toggleExpand}>
        {expand ? <ChevronDown /> : <ChevronRight />}
        {t('write.titleVersion.sidebar')}

        {!readOnly && (
          <Button
            className={styles.headingAction}
            small={true}
            disabled={readOnly}
            onClick={createNewVersion}
          >
            {t('write.newVersion.button')}
          </Button>
        )}
        {readOnly && (
          <Link
            className={clsx(
              buttonStyles.button,
              buttonStyles.secondary,
              styles.editMode,
              styles.headingAction
            )}
            to={`/article/${article._id}`}
          >
            {' '}
            <ArrowLeft /> Edit Mode
          </Link>
        )}
      </h1>
      {expand && (
        <>
          {expandCreateForm && (
            <CreateVersion
              articleId={article._id}
              readOnly={readOnly}
              onClose={closeNewVersion}
            />
          )}

          {articleVersions.length === 0 && (
            <p>
              <strong>All changes are automatically saved.</strong>
              <br />
              Create a new version to keep track of particular changes.
            </p>
          )}

          <ul className={styles.versionsList}>
            <WorkingVersion
              articleId={article._id}
              selectedVersion={selectedVersion}
              compareTo={compareTo}
              readOnly={readOnly}
            />

            {articleVersions.map((v) => (
              <Version
                key={`showVersion-${v._id}`}
                articleId={article._id}
                selectedVersion={selectedVersion}
                compareTo={compareTo}
                readOnly={readOnly}
                v={v}
              />
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
  readOnly: PropTypes.bool,
}
