import React, { useEffect, useMemo, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import { AlertCircle, AlignLeft, Check, Edit3, Eye, Loader, Printer } from 'react-feather'

import styles from './workingVersion.module.scss'
import formatTimeAgo from '../../helpers/formatTimeAgo'
import buttonStyles from "../button.module.scss";
import Button from "../Button";
import Modal from "../Modal";
import Export from "../Export";
import clsx from 'clsx';

const ONE_MINUTE = 60000

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

export function ArticleVersion ({ version }) {
  return <span>
    {!version && <>working copy</>}
    {version && <>
      <span className={styles.versionLabel}>{version.message || 'No label'}</span>
      <span className={styles.versionNumber}>{version.major}.{version.minor}</span>
    </>}
  </span>
}

export function ArticleSaveState ({ state, updatedAt, stateMessage }) {
  const [lastRefreshedAt, setLastRefresh] = useState(Date.now())
  const stateUi = stateUiProps[state]

  const [savedAgo, isoString] = useMemo(() => ([
    formatTimeAgo(updatedAt),
    new Date(parseInt(updatedAt, 10)).toISOString()
  ]), [lastRefreshedAt])

  useEffect(() => {
    const timer = setTimeout(() => setLastRefresh(Date.now() * 1000), ONE_MINUTE)
    return () => clearTimeout(timer)
  }, [])

  return (<>
    <span className={stateUi.style}>
      {state !== 'saved' && stateUi.icon}
      {state !== 'saveFailure' && stateUi.text}
      {state === 'saveFailure' && (<span>
        <strong>{stateUi.text}</strong>
        {stateMessage}
      </span>)}
    </span>

    {state === 'saved' && (<time dateTime={isoString}>{savedAgo}</time>)}
  </>)
}

export default function WorkingVersion ({ articleInfos, selectedVersion }) {
  const [exporting, setExporting] = useState(false)
  const workingArticle = useSelector(state => state.workingArticle, shallowEqual)

  const articleOwnerAndContributors = [
    articleInfos.owner.displayName,
    ...articleInfos.contributors.map(contributor => contributor.user.displayName )
  ]

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <AlignLeft />
          {articleInfos.title}
        </h1>

        <div className={styles.meta}>
          <ul className={styles.byLine}>
            <li className={styles.owners}>by {articleOwnerAndContributors.join(', ')}</li>
            <li className={styles.version}>
              <ArticleVersion version={selectedVersion} />
            </li>
            <li className={styles.lastSaved}>
              <ArticleSaveState state={workingArticle.state} updatedAt={workingArticle.updatedAt} stateMessage={workingArticle.stateMessage} />
            </li>
          </ul>
        </div>
      </header>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export articleVersionId={selectedVersion} articleId={articleInfos._id} />
        </Modal>
      )}
      <ul className={styles.actions}>
        <li>
          <Link to={`/article/${articleInfos._id}`} className={clsx(buttonStyles.button, buttonStyles.primary)}>
            <Edit3 /> Edit
          </Link>
        </li>
        <li>
          <Link to={`/article/${articleInfos._id}/preview`} className={clsx(buttonStyles.button, buttonStyles.secondary)}>
            <Eye /> Preview
          </Link>
        </li>
        <li>
          <Button secondary onClick={() => setExporting(true)}>
            <Printer /> Export
          </Button>
        </li>
      </ul>
    </section>
  )
}
