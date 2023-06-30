import { Badge, Dot, Modal as GeistModal, useModal } from '@geist-ui/core'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { Edit3 } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useMutation } from '../../hooks/graphql.js'
import Button from '../Button.jsx'

import { startSoloSession } from './SoloSession.graphql'

export default function SoloSessionAction({ collaborativeSession, soloSession, articleId }) {
  const { t } = useTranslation()
  const history = useHistory()
  const mutation = useMutation()
  const {
    visible: soloSessionAlreadyExistsVisible,
    setVisible: setSoloSessionAlreadyExistsVisible,
    bindings: soloSessionAlreadyExistsBinding
  } = useModal()

  const handleStartSoloEditing = useCallback(async () => {
    // try to start a collaborative editing
    if (soloSession && soloSession.id) {
      // join existing solo session
      history.push(`/article/${articleId}`)
    } else {
      // start a new solo session
      const data = await mutation({ query: startSoloSession, variables: { articleId } })
      if (data.error) {
        // already exists?
        setSoloSessionAlreadyExistsVisible(true)
      } else {
        history.push(`/article/${articleId}`)
      }
    }
  }, [collaborativeSession])

  if (collaborativeSession) {
    return <></>
  }

  return (
    <>
      <Button title="Edit article" primary={true}  onClick={handleStartSoloEditing}>
        <Edit3/>
        {soloSession && <Dot type="error" />}
      </Button>
      <GeistModal width="35rem" visible={soloSessionAlreadyExistsVisible} {...soloSessionAlreadyExistsBinding}>
        <h2>{t('article.soloSessionAlreadyExists.title')}</h2>
        <GeistModal.Content>
          {t('article.soloSessionAlreadyExists.message')}
        </GeistModal.Content>
        <GeistModal.Action onClick={() => setSoloSessionAlreadyExistsVisible(false)}>
          {t('modal.confirmButton.text')}
        </GeistModal.Action>
      </GeistModal>
    </>
  )
}

SoloSessionAction.propTypes = {
  articleId: PropTypes.string.isRequired,
  soloSession: PropTypes.shape({
    id: PropTypes.string
  }),
  collaborativeSession: PropTypes.shape({
    id: PropTypes.string
  })
}
