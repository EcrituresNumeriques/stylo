import { Squirrel } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '../Button.jsx'

/**
 *
 * @param articleId
 * @return {Element}
 * @constructor
 */
export default function SoloSessionAction({ articleId }) {
  const { t } = useTranslation()
  const history = useHistory()
  return (
    <>
      <Button
        title={t('soloSessionAction.launchSoloSessionButton.title')}
        icon={true}
        onClick={() => history.push(`/legacy/article/${articleId}`)}
      >
        <Squirrel />
      </Button>
    </>
  )
}
