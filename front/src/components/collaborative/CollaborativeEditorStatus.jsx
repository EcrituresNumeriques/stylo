import {
  Button,
  Modal as GeistModal,
  useModal,
  useToasts,
} from '@geist-ui/core'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { StopCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

import { stopCollaborativeSession } from './CollaborativeSession.graphql'

import styles from './CollaborativeEditorStatus.module.scss'
import { useGraphQLClient } from '../../helpers/graphQL.js'

export default function CollaborativeEditorStatus({
  articleId,
  websocketStatus,
  collaborativeSessionState,
}) {
  const { t } = useTranslation()
  const { query } = useGraphQLClient()
  const { setToast } = useToasts()
  const history = useHistory()

  const {
    visible: collaborativeSessionEndVisible,
    setVisible: setCollaborativeSessionEndVisible,
    bindings: collaborativeSessionEndBinding,
  } = useModal()

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

  const handleConfirmCollaborativeSessionEnd = useCallback(async () => {
    setCollaborativeSessionEndVisible(true)
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
            <Button
              className={clsx(styles.button)}
              type="error"
              ghost
              auto
              scale={0.4}
              onClick={handleConfirmCollaborativeSessionEnd}
            >
              <StopCircle /> End collaborative session
            </Button>
          )}
      </div>
      <GeistModal
        width="35rem"
        visible={collaborativeSessionEndVisible}
        {...collaborativeSessionEndBinding}
        onClose={handleEndCollaborativeSession}
      >
        <h2>{t('article.collaborativeSessionEnd.title')}</h2>
        <GeistModal.Content>
          {t('article.collaborativeSessionEnd.confirmMessage')}
        </GeistModal.Content>
        <GeistModal.Action
          passive
          onClick={() => setCollaborativeSessionEndVisible(false)}
        >
          {t('modal.cancelButton.text')}
        </GeistModal.Action>
        <GeistModal.Action onClick={handleEndCollaborativeSession}>
          {t('modal.confirmButton.text')}
        </GeistModal.Action>
      </GeistModal>
    </>
  )
}

CollaborativeEditorStatus.propTypes = {
  articleId: PropTypes.string.isRequired,
  websocketStatus: PropTypes.string.isRequired,
  collaborativeSessionState: PropTypes.string.isRequired,
}
