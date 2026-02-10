import React from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '../../molecules/Modal.jsx'
import WorkspaceUpdateFormMetadata from './WorkspaceUpdateFormMetadata.jsx'

export default function WorkspaceUpdateFormMetadataModal({
  close,
  bindings,
  workspace,
}) {
  const { t } = useTranslation('workspace', { useSuspense: false })
  return (
    <Modal {...bindings} title={t('actions.metadata.label')}>
      <WorkspaceUpdateFormMetadata
        onSubmit={() => close()}
        onCancel={() => close()}
        workspace={workspace}
      />
    </Modal>
  )
}
