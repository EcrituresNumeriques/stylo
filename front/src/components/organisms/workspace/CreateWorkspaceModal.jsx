import React from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '../../molecules/Modal.jsx'
import CreateWorkspace from './CreateWorkspace.jsx'

export default function CreateWorkspaceModal({ close, bindings }) {
  const { t } = useTranslation('workspace', { useSuspense: false })
  return (
    <Modal {...bindings} title={t('actions.create.title')}>
      <CreateWorkspace onSubmit={() => close()} onCancel={() => close()} />
    </Modal>
  )
}
