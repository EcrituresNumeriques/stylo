import { Button, Loading, Modal as GeistModal, useModal, useToasts } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { StopCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import useGraphQL, { useMutation } from '../../hooks/graphql.js'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'

import { stopCollaborativeSession, getCollaborativeSession } from './CollaborativeSession.graphql'

import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorArticleStats from './CollaborativeEditorArticleStats.jsx'
import CollaborativeSessionError from './CollaborativeSessionError.jsx'
import CollaborativeTextEditor from './CollaborativeTextEditor.jsx'

import styles from './CollaborativeEditor.module.scss'


export default function CollaborativeEditor () {
  const activeUser = useSelector(state => state.activeUser)
  const { t } = useTranslation()
  const mutation = useMutation()
  const { setToast } = useToasts()
  const history = useHistory()
  const { sessionId: collaborativeSessionId, articleId } = useParams()

  const {
    data: collaborativeSessionData,
    isLoading: collaborativeSessionLoading,
  } = useGraphQL({ query: getCollaborativeSession, variables: { articleId } })

  const {
    visible: collaborativeSessionEndVisible,
    setVisible: setCollaborativeSessionEndVisible,
    bindings: collaborativeSessionEndBinding
  } = useModal()

  const handleConfirmCollaborativeSessionEnd = useCallback(async () => {
    setCollaborativeSessionEndVisible(true)
  }, [])

  const handleEndCollaborativeSession = useCallback(async () => {
    try {
      await mutation({ query: stopCollaborativeSession, variables: { articleId } })
      setToast({
        type: 'default',
        text: 'Collaborative session ended'
      })
      history.push('/articles')
    } catch (err) {
      setToast({
        type: 'error',
        text: 'Unable to stop the collaborative session: ' + err.toString()
      })
    }
  }, [mutation])

  if (collaborativeSessionLoading) {
    return <Loading/>
  }

  if (collaborativeSessionData?.article?.collaborativeSession?.id !== collaborativeSessionId) {
    return <div className={styles.errorContainer}>
      <CollaborativeSessionError error="notFound"/>
    </div>
  }

  return (
    <div className={styles.container}>
      {collaborativeSessionData?.article?.collaborativeSession?.creator?._id === activeUser?._id && <div className={styles.actions}>
        <Button className={styles.button} type="error" ghost auto scale={0.7} onClick={handleConfirmCollaborativeSessionEnd}><StopCircle/> End collaborative session</Button>
      </div>}
      <GeistModal width="35rem" visible={collaborativeSessionEndVisible} {...collaborativeSessionEndBinding} onClose={handleEndCollaborativeSession}>
        <h2>{t('article.collaborativeSessionEnd.title')}</h2>
        <GeistModal.Content>
          {t('article.collaborativeSessionEnd.confirmMessage')}
        </GeistModal.Content>
        <GeistModal.Action passive onClick={() => setCollaborativeSessionEndVisible(false)}>
          {t('modal.cancelButton.text')}
        </GeistModal.Action>
        <GeistModal.Action onClick={handleEndCollaborativeSession}>{t('modal.confirmButton.text')}</GeistModal.Action>
      </GeistModal>

      <CollaborativeEditorArticleHeader articleId={articleId}/>
      <CollaborativeTextEditor collaborativeSessionId={collaborativeSessionId}/>
      <CollaborativeEditorArticleStats/>
    </div>)
}
