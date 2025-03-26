import { Badge } from '@geist-ui/core'
import React, { useCallback, useMemo } from 'react'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import { useGraphQLClient } from '../../helpers/graphQL.js'
import { useModal } from '../../hooks/modal.js'

import { startCollaborativeSession } from '../Article.graphql'

import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import FormActions from '../molecules/FormActions.jsx'

/**
 * @param props
 * @param {{id: string}} props.collaborativeSession
 * @param {string} props.articleId
 * @return {Element}
 */
export default function CollaborativeSessionAction({
  collaborativeSession,
  articleId,
}) {
  const { t } = useTranslation()
  const history = useHistory()
  const { query } = useGraphQLClient()
  const collaborativeEditingModal = useModal()

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

  return (
    <>
      <Button
        title={t(
          'collaborativeSessionAction.launchCollaborativeSessionButton.title'
        )}
        icon={true}
        onClick={() => collaborativeEditingModal.show()}
      >
        <Users />
        {collaborativeSession && collaborativeSession.id && (
          <Badge type="error">Live</Badge>
        )}
      </Button>
      <Modal
        {...collaborativeEditingModal.bindings}
        title={
          <>
            <Users /> {collaborativeSessionDialogTitle}
          </>
        }
      >
        <p style={{ textAlign: 'start' }}>
          {collaborativeSessionDialogMessage}
        </p>
        <FormActions
          onCancel={() => collaborativeEditingModal.close()}
          onSubmit={handleStartCollaborativeEditing}
        />
      </Modal>
    </>
  )
}
