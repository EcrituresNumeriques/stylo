import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlignLeft,
  Check,
  Edit3,
  Eye,
  Loader,
  Printer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toBibtex } from '../../helpers/bibtex.js'
import { useModal } from '../../hooks/modal.js'
import Button from '../Button'
import buttonStyles from '../button.module.scss'
import Export from '../Export'
import Modal from '../Modal'
import TimeAgo from '../TimeAgo.jsx'

import styles from './workingVersion.module.scss'

const ONE_MINUTE = 60000

export function ArticleVersion({ version }) {
  const { t } = useTranslation()

  return (
    <span>
      {!version && <span>{t('workingVersion.spanWorkingCopy.text')}</span>}
      {version && version.message && (
        <span>
          <span className={styles.versionLabel}>{version.message}</span>
          <span className={styles.versionNumber}>
            v{version.major}.{version.minor}
          </span>
        </span>
      )}
      {version && !version.message && (
        <span>
          <span className={styles.versionNumber}>
            v{version.major}.{version.minor}
          </span>
        </span>
      )}
    </span>
  )
}

export function ArticleSaveState({ state, updatedAt, stateMessage }) {
  const [lastRefreshedAt, setLastRefresh] = useState(Date.now())
  const { t } = useTranslation()

  const stateUiProps = {
    saved: {
      text: t('workingVersion.stateUiProps.savedText'),
      icon: <Check />,
      style: styles.savedIndicator,
    },
    saving: {
      text: t('workingVersion.stateUiProps.savingText'),
      icon: <Loader />,
      style: styles.savingIndicator,
    },
    saveFailure: {
      text: t('workingVersion.stateUiProps.saveErrorText'),
      icon: <AlertCircle />,
      style: styles.failureIndicator,
    },
  }
  const stateUi = stateUiProps[state]

  const isoString = useMemo(
    () => new Date(updatedAt).toISOString(),
    [updatedAt, lastRefreshedAt]
  )

  useEffect(() => {
    const timer = setTimeout(
      () => setLastRefresh(Date.now() * 1000),
      ONE_MINUTE
    )
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <span className={stateUi.style}>
        {state !== 'saved' && stateUi.icon}
        {state !== 'saveFailure' && stateUi.text}
        {state === 'saveFailure' && (
          <span>
            <strong>{stateUi.text}</strong>
            {stateMessage}
          </span>
        )}
      </span>

      {state === 'saved' && isoString && <TimeAgo date={isoString} />}
    </>
  )
}

export default function WorkingVersion({
  articleInfos,
  live,
  selectedVersion,
  mode,
}) {
  const workingArticle = useSelector(
    (state) => state.workingArticle,
    shallowEqual
  )
  const { t } = useTranslation()
  const exportModal = useModal()
  const previewUrl = selectedVersion
    ? `/article/${articleInfos._id}/version/${selectedVersion}/preview`
    : `/article/${articleInfos._id}/preview`
  const articleOwnerAndContributors = [
    articleInfos.owner.displayName,
    ...articleInfos.contributors.map(
      (contributor) => contributor.user.displayName
    ),
  ]

  return (
    <>
      <section className={styles.section}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <AlignLeft />
            {articleInfos.title}
          </h1>
        </header>
        <Modal
          {...exportModal.bindings}
          title={
            <>
              <Printer /> Export
            </>
          }
        >
          <Export
            articleVersionId={selectedVersion}
            articleId={articleInfos._id}
            bib={toBibtex(workingArticle.bibliography.entries.slice(0, 3))}
            name={articleInfos.title}
            onCancel={() => exportModal.close()}
          />
        </Modal>
        <ul className={styles.actions}>
          {articleInfos.preview.stylesheet && (
            <>
              <li>
                <Link
                  to={`/article/${articleInfos._id}`}
                  className={
                    mode === 'write'
                      ? buttonStyles.primaryDisabled
                      : buttonStyles.secondary
                  }
                  title="Edit article"
                >
                  <Edit3 /> Edit
                </Link>
              </li>
              <li>
                <Link
                  to={`/article/${articleInfos._id}/preview`}
                  className={
                    mode === 'preview'
                      ? buttonStyles.primaryDisabled
                      : buttonStyles.secondary
                  }
                  title="Preview article"
                >
                  <Eye />
                  {articleInfos.preview.stylesheet ? (
                    'Paged.js'
                  ) : (
                    <abbr title="HyperText Markup Language">HTML</abbr>
                  )}
                  &nbsp;Preview
                </Link>
              </li>
            </>
          )}
          <li>
            <Button
              icon
              title={t('write.title.buttonExport')}
              onClick={() => exportModal.show()}
            >
              <Printer />
            </Button>
          </li>
          <li>
            <Link
              to={previewUrl}
              title={t('write.title.buttonPreview')}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles.icon}
            >
              <Eye />
            </Link>
          </li>
        </ul>
      </section>
      <section>
        <div className={styles.meta}>
          <ul className={styles.byLine}>
            <li className={styles.owners}>
              {t('workingVersion.by.text')}{' '}
              {articleOwnerAndContributors.join(', ')}
            </li>
            <li className={styles.version}>
              <ArticleVersion version={live.version} />
            </li>
            {!live.version && (
              <li className={styles.lastSaved}>
                <ArticleSaveState
                  state={workingArticle.state}
                  updatedAt={workingArticle.updatedAt}
                  stateMessage={workingArticle.stateMessage}
                />
              </li>
            )}
          </ul>
        </div>
      </section>
    </>
  )
}
