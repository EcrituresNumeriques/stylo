import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { Link } from "react-router-dom";
import { AlertCircle, AlignLeft, Check, Edit3, Eye, Loader, Printer } from 'react-feather'
import TimeAgo from '../TimeAgo.jsx'

import styles from './workingVersion.module.scss'
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

export function ArticleVersion ({ version }) {
  return <span>
    {!version && <span>working copy</span>}
    {version && version.message && <span>
      <span className={styles.versionLabel}>{version.message}</span>
      <span className={styles.versionNumber}>v{version.major}.{version.minor}</span>
    </span>}
    {version && !version.message && <span>
      <span className={styles.versionNumber}>v{version.major}.{version.minor}</span>
    </span>}
  </span>
}

export function ArticleSaveState ({ state, updatedAt, stateMessage }) {
  const [lastRefreshedAt, setLastRefresh] = useState(Date.now())
  const stateUi = stateUiProps[state]

  const isoString = useMemo(() => new Date(updatedAt).toISOString(), [updatedAt, lastRefreshedAt])

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

    {state === 'saved' && (<TimeAgo date={isoString}/>)}
  </>)
}

export default function WorkingVersion ({ articleInfos, live, selectedVersion, mode }) {
  const [exporting, setExporting] = useState(false)
  const workingArticle = useSelector(state => state.workingArticle, shallowEqual)
  const cancelExport = useCallback(() => setExporting(false), [])
  const openExport = useCallback(() => setExporting(true), [])

  const articleOwnerAndContributors = [
    articleInfos.owner.displayName,
    ...articleInfos.contributors.map(contributor => contributor.user.displayName)
  ]

  return (
    <>
      <section className={styles.section}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <AlignLeft/>
            {articleInfos.title}
          </h1>
        </header>
        {exporting && (
          <Modal title="Export" cancel={cancelExport}>
            <Export articleVersionId={selectedVersion} articleId={articleInfos._id} bib={live.bibPreview} name={articleInfos.title} />
          </Modal>
        )}
        <ul className={styles.actions}>
          {articleInfos.preview.stylesheet && (<><li>
            <Link to={`/article/${articleInfos._id}`} className={mode === 'write' ? buttonStyles.primaryDisabled : buttonStyles.secondary} title="Edit article">
              <Edit3/> Edit
            </Link>
          </li>
          <li>
            <Link to={`/article/${articleInfos._id}/preview`} className={mode === 'preview' ? buttonStyles.primaryDisabled : buttonStyles.secondary} title="Preview article">
              <Eye/>{articleInfos.preview.stylesheet ? 'Paged.js' : <abbr title="HyperText Markup Language">HTML</abbr>}
            &nbsp;Preview
            </Link>
          </li></>)}
          <li>
            <Button icon title="Download a printable version" onClick={openExport}>
              <Printer/>
            </Button>
          </li>
          <li>
            <Link to={`/article/${articleInfos._id}/preview`} title="Preview (open a new window)" target="_blank" rel="noopener noreferrer"
                  className={buttonStyles.icon}>
              <Eye/>
            </Link>
          </li>
        </ul>
      </section>
      <section>
        <div className={styles.meta}>
          <ul className={styles.byLine}>
            <li className={styles.owners}>by {articleOwnerAndContributors.join(', ')}</li>
            <li className={styles.version}>
              <ArticleVersion version={live.version}/>
            </li>
            {!live.version && <li className={styles.lastSaved}>
              <ArticleSaveState state={workingArticle.state} updatedAt={workingArticle.updatedAt} stateMessage={workingArticle.stateMessage}/>
            </li>}
          </ul>
        </div>
      </section>
    </>
  )
}
