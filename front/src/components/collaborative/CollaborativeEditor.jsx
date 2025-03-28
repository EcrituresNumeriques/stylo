import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import useFetchData from '../../hooks/graphql.js'
import ArticleStats from '../ArticleStats.jsx'
import Loading from '../molecules/Loading.jsx'

import { getCollaborativeSession } from './CollaborativeSession.graphql'

import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeSessionError from './CollaborativeSessionError.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'

import styles from './CollaborativeEditor.module.scss'
import CollaborativeEditorMenu from './CollaborativeEditorMenu.jsx'

export default function CollaborativeEditor() {
  const { sessionId: collaborativeSessionId, articleId } = useParams()

  const {
    data: collaborativeSessionData,
    isLoading: collaborativeSessionLoading,
    mutate: mutateCollaborativeSession,
  } = useFetchData({ query: getCollaborativeSession, variables: { articleId } })

  const handleCollaborativeSessionStateUpdated = useCallback(({ state }) => {
    if (state === 'ended') {
      mutateCollaborativeSession()
    }
  }, [])

  if (collaborativeSessionLoading) {
    return <Loading />
  }

  if (
    collaborativeSessionData?.article?.collaborativeSession?.id !==
    collaborativeSessionId
  ) {
    return (
      <div className={styles.errorContainer}>
        <CollaborativeSessionError error="notFound" />
      </div>
    )
  }

  const collaborativeSessionCreatorId =
    collaborativeSessionData?.article?.collaborativeSession?.creator?._id

  return (
    <section className={styles.container}>
      <div className={styles.main} role="main">
        <CollaborativeEditorArticleHeader articleId={articleId} />
        <CollaborativeTextEditor
          articleId={articleId}
          collaborativeSessionCreatorId={collaborativeSessionCreatorId}
          collaborativeSessionId={collaborativeSessionId}
          onCollaborativeSessionStateUpdated={
            handleCollaborativeSessionStateUpdated
          }
        />
        <ArticleStats />
      </div>
      <CollaborativeEditorMenu articleId={articleId} />
    </section>
  )
}
