import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import styles from './workingVersion.module.scss'
import Button from '../Button'
import { AlertCircle, Loader, Check } from 'react-feather'
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
    icon: <Check />,
    style: styles.savedIndicator
  },
  saving: {
    text: 'Saving',
    icon: <Loader />,
    style: styles.savingIndicator
  },
  saveFailure: {
    text: 'Error',
    icon: <AlertCircle />,
    style: styles.failureIndicator
  },
}

const WorkingVersion = ({ articleInfos, workingArticle, readOnly }) => {
  const [exporting, setExporting] = useState(false)
  const [savedAgo, setSavedAgo] = useState('')

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
      <header>
        <h1 className={styles.title}>{articleInfos.title}</h1>

        <div className={styles.meta}>
          <div className={styles.by}>by</div>
          <div className={styles.byLine}>
            <span className={styles.owners}>{articleOwnerAndContributors.join(', ')}</span>
            <span className={styles.lastSaved}>
              <span className={stateUi.style}>
                {state !== 'saved' && stateUi.icon}
                {state !== 'saveFailure' && stateUi.text}
                {state === 'saveFailure' && (<span>
                  <strong>{stateUi.text}</strong>
                  {workingArticle.stateMessage}
                </span>)}

              </span>

              {state === 'saved' && (<time dateTime={articleLastSavedAt}>{savedAgo}</time>)}

            </span>
          </div>
        </div>
      </header>
      {exporting && (
        <Modal cancel={() => setExporting(false)}>
          <Export
            articleId={articleInfos._id}
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
            Preview
          </Link>
        </li>
        <li>
          <Button onClick={() => setExporting(true)}>Export</Button>
        </li>
      </ul>
    </section>
  )
}

export default connect(mapStateToProps)(WorkingVersion)
