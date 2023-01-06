import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { Link, useRouteMatch } from "react-router-dom";
import { AlertCircle, AlignLeft, Check, Edit3, Eye, Loader, MessageSquare, Printer } from 'react-feather'

import styles from './workingVersion.module.scss'
import formatTimeAgo from '../../helpers/formatTimeAgo'
import buttonStyles from "../button.module.scss";
import Button from "../Button";
import Modal from "../Modal";
import Export from "../Export";

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

const MODES_EDIT = 'edit'
const MODES_PREVIEW = 'preview'

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
  const routeMatch = useRouteMatch()
  const workingArticle = useSelector(state => state.workingArticle, shallowEqual)
  const cancelExport = useCallback(() => setExporting(false), [])
  const openExport = useCallback(() => setExporting(true), [])
  const mode = routeMatch.path === '/article/:id/preview' ? MODES_PREVIEW : MODES_EDIT

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
        <Modal title="Export" cancel={cancelExport}>
          <Export articleVersionId={selectedVersion} articleId={articleInfos._id} />
        </Modal>
      )}
      <ul className={styles.actions}>
        <li>
          <Link to={`/article/${articleInfos._id}`} className={mode === MODES_EDIT ? buttonStyles.primaryDisabled : buttonStyles.secondary} title="Edit article">
            <Edit3 /> Edit
          </Link>
        </li>
        <li>
          <Link to={`/article/${articleInfos._id}/preview`} className={mode === MODES_PREVIEW ? buttonStyles.primaryDisabled : buttonStyles.secondary} title="Preview article">
            <Eye /> <abbr title="HyperText Markup Language">HTML</abbr>&#160;Preview
          </Link>
        </li>
        <li>
          <Button icon title="Download a printable version" onClick={openExport}>
            <Printer />
          </Button>
        </li>
        <li>
          <Link to={`/article/${articleInfos._id}/annotate`} title="Annotate with Stylo users and other people (open a new window)" target="_blank" rel="noopener noreferrer" className={buttonStyles.icon}>
            <MessageSquare />
          </Link>
        </li>
      </ul>
    </section>
  )
}
