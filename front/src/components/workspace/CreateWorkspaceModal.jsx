import { Modal as GeistModal } from '@geist-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CreateWorkspace from './CreateWorkspace.jsx'

export default function CreateWorkspaceModal({
  visible,
  setVisible,
  bindings,
}) {
  const { t } = useTranslation()
  return (
    <GeistModal width="45rem" visible={visible} {...bindings}>
      <h2>{t('workspace.createModal.title')}</h2>
      <GeistModal.Content>
        <CreateWorkspace onSubmit={() => setVisible(false)} />
      </GeistModal.Content>
      <GeistModal.Action passive onClick={() => setVisible(false)}>
        {t('modal.close.text')}
      </GeistModal.Action>
    </GeistModal>
  )
}
