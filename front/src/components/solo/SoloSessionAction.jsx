import { Dot, useToasts } from '@geist-ui/core'
import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import { Edit3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'

import { startSoloSession, takeOverSoloSession } from './SoloSession.graphql'

import styles from './SoloSessionAction.module.scss'

export default function SoloSessionAction({
  collaborativeSession,
  soloSession,
  articleId,
}) {
  const { t } = useTranslation()
  const activeUser = useSelector((state) => state.activeUser)
  const { setToast } = useToasts()
  const history = useHistory()
  const [activeSoloSessionCreator, setActiveSoloSessionCreator] = useState('')
  const { query } = useGraphQLClient()
  const takeOverModal = useModal()
  const handleStartSoloEditing = useCallback(async () => {
    if (soloSession && soloSession.id) {
      if (soloSession.creator !== activeUser._id) {
        setActiveSoloSessionCreator(soloSession.creatorUsername)
        takeOverModal.show()
      } else {
        history.push(`/article/${articleId}`)
      }
    } else {
      // start a new solo session
      try {
        await query({ query: startSoloSession, variables: { articleId } })
        history.push(`/article/${articleId}`)
      } catch (err) {
        if (
          err &&
          err.messages &&
          err.messages.length > 0 &&
          err.messages[0].extensions &&
          err.messages[0].extensions.type === 'UNAUTHORIZED_SOLO_SESSION_ACTIVE'
        ) {
          // already exists
          history.push(`/article/${articleId}`)
        } else {
          setToast({
            type: 'error',
            text: `Unable to start a solo session: ${err.toString()}`,
          })
        }
      }
    }
  }, [soloSession, takeOverModal])

  const handleTakeOver = useCallback(async () => {
    try {
      await query({ query: takeOverSoloSession, variables: { articleId } })
      takeOverModal.close()
      history.push(`/article/${articleId}`)
    } catch (err) {
      setToast({
        type: 'error',
        text: `Unable to take over this solo session: ${err.toString()}`,
      })
    }
  }, [takeOverModal])

  if (collaborativeSession && collaborativeSession.id) {
    return <></>
  }

  return (
    <>
      <Modal {...takeOverModal.bindings} title={t('modal.takeOver.title')}>
        <p className={styles.description}>
          {t('modal.takeOver.description', {
            creator: activeSoloSessionCreator,
          })}
        </p>
        <footer className={styles.actions}>
          <Button secondary={true} onClick={() => takeOverModal.close()}>
            {t('modal.cancelButton.text')}
          </Button>
          <Button primary={true} onClick={() => handleTakeOver()}>
            {t('modal.confirmButton.text')}
          </Button>
        </footer>
      </Modal>

      <Button
        title={t('soloSessionAction.launchSoloSessionButton.title')}
        primary={true}
        onClick={handleStartSoloEditing}
      >
        <Edit3 />
        {soloSession && <Dot type="error" />}
      </Button>
    </>
  )
}

SoloSessionAction.propTypes = {
  articleId: PropTypes.string.isRequired,
  soloSession: PropTypes.shape({
    id: PropTypes.string,
    creator: PropTypes.string,
    creatorUsername: PropTypes.string,
  }),
  collaborativeSession: PropTypes.shape({
    id: PropTypes.string,
  }),
}
