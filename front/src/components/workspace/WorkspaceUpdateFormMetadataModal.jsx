import React from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '../Modal.jsx'
import WorkspaceUpdateFormMetadata from './WorkspaceUpdateFormMetadata.jsx'

export default function WorkspaceUpdateFormMetadataModal({
  close,
  bindings,
  workspace,
}) {
  const { t } = useTranslation()
  return (
    <Modal {...bindings} title={t('workspace.updateFormMetadataModal.title')}>
      <WorkspaceUpdateFormMetadata
        onSubmit={() => close()}
        onCancel={() => close()}
        workspace={workspace}
      />
    </Modal>
  )
}
