import React, { useEffect, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import styles from './workingVersion.module.scss'
import { AlertCircle, Check, Eye, Loader, Printer } from 'react-feather'

import formatTimeAgo from '../../helpers/formatTimeAgo'
import { Link } from "react-router-dom";
import buttonStyles from "../button.module.scss";
import Button from "../Button";
import Modal from "../Modal";
import Export from "../Export";
import { generateArticleExportId } from "../../helpers/identifier";

const stateUiProps = {
  saved: {
    text: 'Last saved',
    icon: <Check/>,
    style: styles.savedIndicator
  },
  saving: {
    text: 'Saving',
    icon: <Loader/>,
    style: styles.savingIndicator
  },
  saveFailure: {
    text: 'Error',
    icon: <AlertCircle/>,
    style: styles.failureIndicator
  },
}

export default function WorkingVersion ({ articleInfos }) {
  const [savedAgo, setSavedAgo] = useState('')

  const [exporting, setExporting] = useState(false)
  const workingArticle = useSelector(state => state.workingArticle, shallowEqual)
  const articleLastSavedAt = workingArticle.updatedAt
  const state = workingArticle.state
  const stateUi = stateUiProps[state]

  const articleOwnerAndContributors = [
    articleInfos.owner.displayName,
    ...articleInfos.contributors.map(contributor => contributor.user.displayName )
  ]

  useEffect(() => {
    setSavedAgo(formatTimeAgo(articleLastSavedAt))
    const timer = setTimeout(() => {
      setSavedAgo(formatTimeAgo(articleLastSavedAt))
    }, 60000)
    return () => clearTimeout(timer)
  }, [articleLastSavedAt])

  const articleVersion = articleInfos.version
    ? <><span className={styles.versionLabel}>{articleInfos.version.message || 'No label'}</span> <span className={styles.versionNumber}>{articleInfos.version.major}.{articleInfos.version.minor}</span></>
    : <span>working copy</span>

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>{articleInfos.title}</h1>

        <div className={styles.meta}>
          <ul className={styles.byLine}>
            <li className={styles.owners}>by {articleOwnerAndContributors.join(', ')}</li>
            <li className={styles.version}>{articleVersion}</li>
            <li className={styles.lastSaved}>
              <span className={stateUi.style}>
                {state !== 'saved' && stateUi.icon}
                {state !== 'saveFailure' && stateUi.text}
                {state === 'saveFailure' && (<span>
                  <strong>{stateUi.text}</strong>
                  {workingArticle.stateMessage}
                </span>)}
              </span>
              {state === 'saved' && (<time dateTime={articleLastSavedAt}>{savedAgo}</time>)}
            </li>
          </ul>
        </div>
      </header>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export
            exportId={generateArticleExportId(articleInfos.title)}
            articleVersionId={articleInfos._id}
          />
        </Modal>
      )}
      <ul className={styles.actions}>
        <li>
          <Link
            to={`/article/${articleInfos._id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className={[buttonStyles.button, buttonStyles.secondary].join(' ')}
          >
            <Eye /> Preview
          </Link>
        </li>
        <li>
          <Button onClick={() => setExporting(true)}>
            <Printer /> Export
          </Button>
        </li>
      </ul>
    </section>
  )
}
