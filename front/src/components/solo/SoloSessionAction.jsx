import { Dot, Modal as GeistModal, useModal, useToasts } from '@geist-ui/core'
import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import { Edit3 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import Button from '../Button.jsx'

import { startSoloSession, takeOverSoloSession } from './SoloSession.graphql'
import { useGraphQLClient } from '../../helpers/graphQL.js'

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
  const {
    visible: takeOverModalVisible,
    setVisible: setTakeOverModalVisible,
    bindings: takeOverModalBinding,
  } = useModal()
  const handleStartSoloEditing = useCallback(async () => {
    if (soloSession && soloSession.id) {
      if (soloSession.creator !== activeUser._id) {
        setActiveSoloSessionCreator(soloSession.creatorUsername)
        setTakeOverModalVisible(true)
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
  }, [soloSession, setTakeOverModalVisible])
  const handleTakeOver = useCallback(async () => {
    try {
      await query({ query: takeOverSoloSession, variables: { articleId } })
      setTakeOverModalVisible(false)
      history.push(`/article/${articleId}`)
    } catch (err) {
      setToast({
        type: 'error',
        text: `Unable to take over this solo session: ${err.toString()}`,
      })
    }
  }, [setTakeOverModalVisible])

  if (collaborativeSession && collaborativeSession.id) {
    return <></>
  }

  return (
    <>
      <GeistModal
        width="30rem"
        visible={takeOverModalVisible}
        {...takeOverModalBinding}
      >
        <h2>Take over</h2>
        <GeistModal.Content>
          Would you like to take over the editing session from{' '}
          {activeSoloSessionCreator}?
        </GeistModal.Content>
        <GeistModal.Action
          passive
          onClick={() => setTakeOverModalVisible(false)}
        >
          {t('modal.cancelButton.text')}
        </GeistModal.Action>
        <GeistModal.Action onClick={() => handleTakeOver()}>
          {t('modal.confirmButton.text')}
        </GeistModal.Action>
      </GeistModal>
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
