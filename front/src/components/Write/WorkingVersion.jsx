import React, { useEffect, useState, useCallback } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AlertCircle, Check, Eye, List, Loader, Printer } from 'react-feather'

import Export from '../Export'
import Button from '../Button'
import Modal from '../Modal'
import TableOfContents from './TableOfContents'

import buttonStyles from '../button.module.scss'
import styles from './workingVersion.module.scss'

import formatTimeAgo from '../../helpers/formatTimeAgo'
import { generateArticleExportId } from '../../helpers/identifier'

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
  const [modal, setModal] = useState(false)
  const openModal = useCallback(() => setModal(true), [])
  const closeModal = useCallback(() => setModal(false), [])
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

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Escape' && modal) {
      closeModal()
    }
  }, [modal]);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress)

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Button title="Table Of Contents" icon={true} className={styles.tableOfContentsButton} onClick={openModal}>
            <List size="20" />
          </Button>
          {articleInfos.title}
        </h1>
        {modal && (
          <Modal cancel={closeModal} withCancelButton={false} withCloseButton={false}>
            <TableOfContents cancel={closeModal} />
          </Modal>
        )}
        <div className={styles.meta}>
          <ul className={styles.byLine}>
            <li className={styles.owners}>by {articleOwnerAndContributors.join(', ')}</li>
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
