import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import i18n from '../../../i18n.js'

import { useArticleVersions } from '../../../hooks/article.js'
import { useModal } from '../../../hooks/modal.js'
import { useDisplayName } from '../../../hooks/user.js'
import { Button } from '../../atoms/index.js'
import { Alert, Loading, Version } from '../../molecules/index.js'

import Modal from '../../molecules/Modal.jsx'
import CreateVersion from '../version/CreateVersion.jsx'

import styles from './CollaborativeVersions.module.scss'

/**
 * @param {object} props
 * @param {boolean} props.showTitle
 * @param {() => void} props.onBack
 * @param {string} props.articleId
 * @param {string} props.selectedVersion
 * @returns {JSX.Element}
 */
export default function CollaborativeVersions({
  showTitle,
  onBack,
  articleId,
  selectedVersion,
}) {
  const articleWorkingCopyStatus = useSelector(
    (state) => state.articleWorkingCopy.status,
    shallowEqual
  )
  const syncing = articleWorkingCopyStatus === 'syncing'
  const navigate = useNavigate()
  const { article, isLoading, error } = useArticleVersions({ articleId })
  const articleVersions = article?.versions
  const createVersionModal = useModal()
  const { t } = useTranslation()
  const displayName = useDisplayName()

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

  const monthYearFormat = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  })

  function versionsPerMonth() {
    let previousVersionDate
    return articleVersions.map((version) => {
      const title =
        version.type === 'editingSessionEnded' ||
        version.type === 'collaborativeSessionEnded'
          ? t(`versions.${version.type}.text`)
          : t('versions.version.text', {
              major: version.version,
              minor: version.revision,
            })

      const date = new Date(version.createdAt)
      const versionItem = (
        <Version
          key={`showVersion-${version._id}`}
          date={date}
          title={title}
          description={version.message}
          type={version.type}
          creator={displayName(version.owner)}
          selected={selectedVersion === version._id}
          onClick={() => {
            navigate(`/article/${articleId}/version/${version._id}`)
          }}
        />
      )
      if (previousVersionDate) {
        if (
          previousVersionDate.getFullYear() !== date.getFullYear() ||
          previousVersionDate.getMonth() !== date.getMonth()
        ) {
          previousVersionDate = date
          return (
            <>
              <div className={styles.monthSeparator}>
                {monthYearFormat.format(date)}
              </div>
              {versionItem}
            </>
          )
        }
      }
      previousVersionDate = date
      return versionItem
    })
  }

  return (
    <section>
      {showTitle && title}
      <Button
        small={true}
        disabled={syncing}
        onClick={() => createVersionModal.show()}
        testId="create-version-button"
      >
        {t('versions.createVersion.button')}
        {syncing && <Loading className={styles.loading} />}
      </Button>
      {articleVersions.length === 0 && (
        <p className={styles.info}>
          <Alert
            type={'info'}
            message={
              <Trans i18nKey="versions.explanation.text">
                <strong>All changes are automatically saved.</strong>
                <span className={styles.tip}>
                  Create a new version to keep track of particular changes.
                </span>
              </Trans>
            }
          />
        </p>
      )}
      <Modal
        title={t('versions.createVersion.title')}
        {...createVersionModal.bindings}
      >
        <CreateVersion
          articleId={article._id}
          onClose={() => createVersionModal.close()}
          onSubmit={() => createVersionModal.close()}
        />
      </Modal>
      <ul className={styles.versions} data-testid="versions">
        <Version
          date={null}
          type="workingCopy"
          title={t('versions.workingCopy.text')}
          selected={!selectedVersion}
          onClick={() => {
            navigate(`/article/${articleId}`)
          }}
        />
        {versionsPerMonth()}
      </ul>
    </section>
  )
}
