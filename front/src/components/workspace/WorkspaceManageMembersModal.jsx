import { Modal as GeistModal } from '@geist-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './workspaceItem.module.scss'
import WorkspaceLabel from './WorkspaceLabel.jsx'
import WorkspaceManageMembers from './WorkspaceManageMembers.jsx'

export default function WorkspaceManageMembersModal({
  visible,
  setVisible,
  bindings,
  workspace,
}) {
  const { t } = useTranslation()
  return (
    <GeistModal
      width="35rem"
      visible={visible}
      onClose={() => setVisible(false)}
      {...bindings}
    >
      <WorkspaceLabel
        className={styles.workspaceLabel}
        color={workspace.color}
        name={workspace.name}
      />
      <h2>{t('workspace.manageMembersModal.title')}</h2>
      <div>{t('workspace.manageMembersModal.subtitle')}</div>
      <GeistModal.Content>
        <WorkspaceManageMembers workspace={workspace} />
      </GeistModal.Content>
      <GeistModal.Action passive onClick={() => setVisible(false)}>
        {t('modal.close.text')}
      </GeistModal.Action>
    </GeistModal>
  )
}
