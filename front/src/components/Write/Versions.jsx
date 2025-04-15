import clsx from 'clsx'
import { ArrowLeft, Check, Edit3 } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import {
  useArticleVersionActions,
  useArticleVersions,
} from '../../hooks/article.js'
import { useModal } from '../../hooks/modal.js'
import Button from '../Button'

import buttonStyles from '../button.module.scss'
import Field from '../Field'
import Modal from '../Modal.jsx'
import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'

import TimeAgo from '../TimeAgo.jsx'
import CreateVersion from './CreateVersion'
import styles from './versions.module.scss'

/**
 *
 * @param props
 * @param props.articleId
 * @param props.compareTo
 * @param props.readOnly
 * @param props.selectedVersion
 * @param props.v
 */
function Version({ articleId, compareTo, readOnly, selectedVersion, v }) {
  const { t } = useTranslation()
  const { updateDescription } = useArticleVersionActions({ articleId })

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
  const canCompare = false
  const canStopCompare = false

  const className = clsx({
    [styles.selected]: isSelected,
    [styles.compareTo]: isComparing && articleVersionId === compareTo,
  })

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
      await updateDescription({
        versionId: articleVersionId,
        description: title,
      })
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

      {(canCompare || canStopCompare) && (
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
      )}
    </li>
  )
}

/**
 * @param props
 * @param props.articleId
 * @param props.selectedVersion
 * @param props.compareTo
 * @param props.updatedAt
 * @return {Element}
 */
export function WorkingVersion({
  articleId,
  selectedVersion = null,
  compareTo = null,
  updatedAt,
}) {
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
  const canCompare = false
  const canStopCompare = false

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

      {(canCompare || canStopCompare) && (
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
      )}
    </li>
  )
}

/**
 * @param {object} props
 * @param {boolean} props.showTitle
 * @param {() => void} props.onBack
 * @param {string} props.articleId
 * @param {string} props.selectedVersion
 * @param {string} props.compareTo
 * @param {boolean} props.readOnly
 * @returns {Element}
 */
export default function Versions({
  showTitle,
  onBack,
  articleId,
  selectedVersion,
  compareTo,
  readOnly,
}) {
  const { article, isLoading, error } = useArticleVersions({ articleId })
  const articleVersions = article?.versions
  const updatedAt = article?.updatedAt
  const createVersionModal = useModal()
  const { t } = useTranslation()

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert message={error.message} />
  }

  const title = onBack ? (
    <h2
      className={styles.title}
      onClick={onBack}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span onClick={onBack} style={{ display: 'flex' }}>
        <ArrowLeft style={{ strokeWidth: 3 }} />
      </span>
      <span>{t('versions.title')}</span>
    </h2>
  ) : (
    <h2 className={styles.title}>{t('versions.title')}</h2>
  )

  return (
    <section>
      {showTitle && title}
      {!readOnly && (
        <Button
          className={styles.headingAction}
          small={true}
          disabled={readOnly}
          onClick={() => createVersionModal.show()}
          testId="create-version-button"
        >
          {t('versions.createVersion.button')}
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
          <ArrowLeft /> Edit Mode
        </Link>
      )}
      {articleVersions.length === 0 && (
        <p>
          <strong>All changes are automatically saved.</strong>
          <br />
          Create a new version to keep track of particular changes.
        </p>
      )}
      <Modal
        title={t('versions.createVersion.title')}
        {...createVersionModal.bindings}
      >
        <CreateVersion
          articleId={article._id}
          readOnly={readOnly}
          onClose={() => createVersionModal.close()}
          onSubmit={() => createVersionModal.close()}
        />
      </Modal>
      <ul className={styles.versionsList} data-testid="versions">
        <WorkingVersion
          articleId={article._id}
          selectedVersion={selectedVersion}
          compareTo={compareTo}
          readOnly={readOnly}
          updatedAt={updatedAt}
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
    </section>
  )
}
