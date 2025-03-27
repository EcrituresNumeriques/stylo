import { Badge } from '@geist-ui/core'
import React, { useCallback, useMemo } from 'react'
import { Edit, Pencil, Users } from 'lucide-react'
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
 * @param {string} props.articleId
 * @return {Element}
 */
export default function CollaborativeSessionAction({ articleId }) {
  const { t } = useTranslation()
  const history = useHistory()

  return (
    <>
      <Button
        title={t(
          'collaborativeSessionAction.launchCollaborativeSessionButton.title'
        )}
        primary={true}
        onClick={() => history.push(`/article/${articleId}`)}
      >
        <Pencil />
      </Button>
    </>
  )
}
