import React from 'react'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import WorkspaceLabel from './WorkspaceLabel.jsx'
import WorkspaceManageMembers from './WorkspaceManageMembers.jsx'

import styles from './workspaceItem.module.scss'

export default function WorkspaceManageMembersModal({
  close,
  bindings,
  workspace,
}) {
  const { t } = useTranslation()
  return (
    <Modal
      {...bindings}
      title={
        <>
          <Users />
          {t('workspace.manageMembersModal.title')}
        </>
      }
      subtitle={t('workspace.manageMembersModal.subtitle')}
    >
      <WorkspaceLabel
        className={styles.workspaceLabel}
        color={workspace.color}
        name={workspace.name}
      />
      <WorkspaceManageMembers workspace={workspace} />
      <div className={styles.actions}>
        <Button secondary onClick={() => close()}>
          {t('modal.close.text')}
        </Button>
      </div>
    </Modal>
  )
}
