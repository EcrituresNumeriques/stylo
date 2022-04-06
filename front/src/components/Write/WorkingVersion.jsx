import React, { useCallback, useEffect, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import styles from './workingVersion.module.scss'
import Button from '../Button'
import { AlertCircle, Check, Loader, PenTool, ToggleLeft, ToggleRight } from 'react-feather'
import { Link } from 'react-router-dom'
import buttonStyles from '../button.module.scss'
import Modal from '../Modal'
import Export from '../Export'
import formatTimeAgo from '../../helpers/formatTimeAgo'
import { generateArticleExportId } from '../../helpers/identifier'

const mapStateToProps = ({ workingArticle }) => {
  return { workingArticle }
}

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

const WorkingVersion = ({ articleInfos, workingArticle, readOnly }) => {
  const dispatch = useDispatch()
  const [exporting, setExporting] = useState(false)
  const [savedAgo, setSavedAgo] = useState('')

  const focusMode = useSelector(state => state.articlePreferences.focusMode)

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

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h1 className={styles.title}>{articleInfos.title}</h1>

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
    </section>
  )
}

export default connect(mapStateToProps)(WorkingVersion)
