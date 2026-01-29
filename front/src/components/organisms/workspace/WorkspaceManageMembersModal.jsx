import { Users } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../atoms/index.js'

import Modal from '../../molecules/Modal.jsx'
import WorkspaceManageMembers from './WorkspaceManageMembers.jsx'

import styles from './WorkspaceManageMembersModal.module.scss'

export default function WorkspaceManageMembersModal({
  close,
  bindings,
  workspace,
}) {
  const { t } = useTranslation('workspace', { useSuspense: false })
  const { t: tModal } = useTranslation('modal', { useSuspense: false })
  return (
    <Modal
      {...bindings}
      title={
        <>
          <Users />
          {t('actions.share.title')}
        </>
      }
      subtitle={t('actions.share.subtitle')}
    >
      <WorkspaceManageMembers workspace={workspace} />
      <div className={styles.actions}>
        <Button secondary onClick={() => close()}>
          {tModal('close.text')}
        </Button>
      </div>
    </Modal>
  )
}
