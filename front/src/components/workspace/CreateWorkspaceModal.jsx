import React from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../Modal.jsx'
import CreateWorkspace from './CreateWorkspace.jsx'

export default function CreateWorkspaceModal({ close, bindings }) {
  const { t } = useTranslation()
  return (
    <Modal {...bindings} title={t('workspace.createModal.title')}>
      <CreateWorkspace onSubmit={() => close()} onCancel={() => close()} />
    </Modal>
  )
}
