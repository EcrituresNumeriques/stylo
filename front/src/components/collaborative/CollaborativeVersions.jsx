import React from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

/**
 * @param {object} props
 * @param {boolean} props.showTitle
 * @param {() => void} props.onBack
 * @param {string} props.articleId
 * @param {string} props.selectedVersion
 * @param {string} props.compareTo
 * @param {boolean} props.readOnly
 * @returns {JSX.Element}
 */
export default function CollaborativeVersions({
  showTitle,
  onBack,
  articleId,
  selectedVersion,
  compareTo,
  readOnly,
}) {
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

  return (
    <section>
      {showTitle && title}
      {!readOnly && (
        <Button
          small={true}
          disabled={readOnly}
          onClick={() => createVersionModal.show()}
          testId="create-version-button"
        >
          {t('versions.createVersion.button')}
        </Button>
      )}
      {articleVersions.length === 0 && (
        <p className={styles.info}>
          <Alert
            type={'info'}
            message={
              <>
                <strong>All changes are automatically saved.</strong>
                <br />
                Create a new version to keep track of particular changes.
              </>
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
          readOnly={readOnly}
          onClose={() => createVersionModal.close()}
          onSubmit={() => createVersionModal.close()}
        />
      </Modal>
      <ul className={styles.versions} data-testid="versions">
        <Version
          date={new Date(updatedAt)}
          type="workingCopy"
          title="Copie de travail"
          selected={!selectedVersion}
          onClick={() => {
            history.push(`/article/${articleId}`)
          }}
        />
        {articleVersions.map((v) => (
          <Version
            key={`showVersion-${v._id}`}
            date={new Date(v.updatedAt)}
            title={`Version ${v.version}.${v.revision}`}
            description={v.message}
            type={v.type}
            creator={v.owner?.displayName || v.owner?.username}
            selected={selectedVersion === v._id}
            onClick={() => {
              history.push(`/article/${articleId}/version/${v._id}`)
            }}
          />
        ))}
      </ul>
    </section>
  )
}
