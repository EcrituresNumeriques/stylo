import { useToasts } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { StopCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import FormActions from '../molecules/FormActions.jsx'

import styles from './CollaborativeEditorStatus.module.scss'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

import { stopCollaborativeSession } from './CollaborativeSession.graphql'

/**
 * @param props
 * @param {string} props.articleId
 * @param {string} props.websocketStatus
 * @param {string} props.collaborativeSessionState
 * @return {Element}
 */
export default function CollaborativeEditorStatus({
  articleId,
  websocketStatus,
  collaborativeSessionState,
}) {
  const { t } = useTranslation()
  const { query } = useGraphQLClient()
  const { setToast } = useToasts()
  const history = useHistory()

  const collaborativeSessionEndModal = useModal()

  const handleEndCollaborativeSession = useCallback(async () => {
    try {
      await query({
        query: stopCollaborativeSession,
        variables: { articleId },
      })
      setToast({
        type: 'default',
        text: 'Collaborative session ended',
      })
      history.push('/articles')
    } catch (err) {
      setToast({
        type: 'error',
        text: 'Unable to stop the collaborative session: ' + err.toString(),
      })
    }
  }, [])

  return (
    <>
      <div className={styles.row}>
        <div className={styles.writers}>
          <CollaborativeEditorWriters />
        </div>
        <div className={styles.status}>
          <CollaborativeEditorWebSocketStatus
            status={websocketStatus}
            state={collaborativeSessionState}
          />
        </div>
        {websocketStatus === 'connected' &&
          collaborativeSessionState === 'started' && (
            <Button primary onClick={() => collaborativeSessionEndModal.show()}>
              <StopCircle /> {t('article.collaborativeSessionEnd.title')}
            </Button>
          )}
      </div>
      <Modal
        {...collaborativeSessionEndModal.bindings}
        title={
          <>
            <StopCircle />
            {t('article.collaborativeSessionEnd.title')}
          </>
        }
      >
        {t('article.collaborativeSessionEnd.confirmMessage')}
        <FormActions
          onCancel={() => collaborativeSessionEndModal.close()}
          onSubmit={handleEndCollaborativeSession}
        />
      </Modal>
    </>
  )
}
