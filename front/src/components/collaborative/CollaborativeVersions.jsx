import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'

import Loading from '../molecules/Loading.jsx'
import Alert from '../molecules/Alert.jsx'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import CreateVersion from '../Write/CreateVersion.jsx'
import Version from '../molecules/Version.jsx'

import { useArticleVersions } from '../../hooks/article.js'
import { useModal } from '../../hooks/modal.js'

import styles from './CollaborativeVersions.module.scss'
import i18n from '../../i18n.js'

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
  const history = useHistory()
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

  const monthYearFormat = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  })

  function getMap() {
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

      const date = new Date(version.updatedAt)
      const versionItem = (
        <Version
          key={`showVersion-${version._id}`}
          date={date}
          title={title}
          description={version.message}
          type={version.type}
          creator={version.owner?.displayName || version.owner?.username}
          selected={selectedVersion === version._id}
          onClick={() => {
            history.push(`/article/${articleId}/version/${version._id}`)
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
        {syncing && <Loading label="" className={styles.loading} />}
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
            history.push(`/article/${articleId}`)
          }}
        />
        {getMap()}
      </ul>
    </section>
  )
}
