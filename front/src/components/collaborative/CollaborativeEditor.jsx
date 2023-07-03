import { Loading } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import useGraphQL from '../../hooks/graphql.js'

import { getCollaborativeSession } from './CollaborativeSession.graphql'

import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorArticleStats from './CollaborativeEditorArticleStats.jsx'
import CollaborativeSessionError from './CollaborativeSessionError.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'

import styles from './CollaborativeEditor.module.scss'


export default function CollaborativeEditor () {
  const { sessionId: collaborativeSessionId, articleId } = useParams()

  const {
    data: collaborativeSessionData,
    isLoading: collaborativeSessionLoading,
    mutate: mutateCollaborativeSession,
  } = useGraphQL({ query: getCollaborativeSession, variables: { articleId } })

  const handleCollaborativeSessionStateUpdated = useCallback(({ state }) => {
    if (state === 'ended') {
      mutateCollaborativeSession()
    }
  }, [])

  if (collaborativeSessionLoading) {
    return <Loading/>
  }

  if (collaborativeSessionData?.article?.collaborativeSession?.id !== collaborativeSessionId) {
    return <div className={styles.errorContainer}>
      <CollaborativeSessionError error="notFound"/>
    </div>
  }

  const collaborativeSessionCreatorId = collaborativeSessionData?.article?.collaborativeSession?.creator?._id

  return (
    <div className={styles.container}>
      <CollaborativeEditorArticleHeader articleId={articleId}/>
      <CollaborativeTextEditor
        articleId={articleId}
        collaborativeSessionCreatorId={collaborativeSessionCreatorId}
        collaborativeSessionId={collaborativeSessionId}
        onCollaborativeSessionStateUpdated={handleCollaborativeSessionStateUpdated}
      />
      <CollaborativeEditorArticleStats/>
    </div>)
}
