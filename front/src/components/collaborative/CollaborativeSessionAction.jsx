import React, { useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Badge, Modal as GeistModal, useModal } from '@geist-ui/core'
import { Users } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { startCollaborativeSession } from '../Article.graphql'
import Button from '../Button.jsx'
import { useGraphQLClient } from '../../helpers/graphQL.js'

export default function CollaborativeSessionAction({
  collaborativeSession,
  articleId,
}) {
  const { t } = useTranslation()
  const history = useHistory()
  const { query } = useGraphQLClient()
  const {
    visible: collaborativeEditingVisible,
    setVisible: setCollaborativeEditingVisible,
    bindings: collaborativeEditingBinding,
  } = useModal()

  const handleStartCollaborativeEditing = useCallback(async () => {
    // try to start a collaborative editing
    if (collaborativeSession && collaborativeSession.id) {
      // join existing collaborative session
      history.push(`/article/${articleId}/session/${collaborativeSession.id}`)
    } else {
      // start a new collaborative session
      const data = await query({
        query: startCollaborativeSession,
        variables: { articleId },
      })
      history.push(
        `/article/${articleId}/session/${data.article.startCollaborativeSession.id}`
      )
    }
  }, [collaborativeSession])

  const collaborativeSessionDialogTitle = useMemo(
    () =>
      collaborativeSession
        ? t('article.collaborativeEditingJoin.title')
        : t('article.collaborativeEditingStart.title'),
    [collaborativeSession]
  )

  const collaborativeSessionDialogMessage = useMemo(
    () =>
      collaborativeSession
        ? t('article.collaborativeEditingJoin.confirmMessage')
        : t('article.collaborativeEditingStart.confirmMessage'),
    [collaborativeSession]
  )

  useEffect(() => {
    return () => {
      setCollaborativeEditingVisible(false)
    }
  }, [])

  return (
    <>
      <Button
        title={t(
          'collaborativeSessionAction.launchCollaborativeSessionButton.title'
        )}
        icon={true}
        onClick={() => setCollaborativeEditingVisible(true)}
      >
        <Users />
        {collaborativeSession && collaborativeSession.id && (
          <Badge type="error">Live</Badge>
        )}
      </Button>
      <GeistModal
        width="35rem"
        visible={collaborativeEditingVisible}
        {...collaborativeEditingBinding}
      >
        <h2>{collaborativeSessionDialogTitle}</h2>
        <GeistModal.Content>
          {collaborativeSessionDialogMessage}
        </GeistModal.Content>
        <GeistModal.Action
          passive
          onClick={() => setCollaborativeEditingVisible(false)}
        >
          {t('modal.cancelButton.text')}
        </GeistModal.Action>
        <GeistModal.Action onClick={handleStartCollaborativeEditing}>
          {t('modal.confirmButton.text')}
        </GeistModal.Action>
      </GeistModal>
    </>
  )
}

CollaborativeSessionAction.propTypes = {
  articleId: PropTypes.string.isRequired,
  collaborativeSession: PropTypes.shape({
    id: PropTypes.string,
  }),
}
