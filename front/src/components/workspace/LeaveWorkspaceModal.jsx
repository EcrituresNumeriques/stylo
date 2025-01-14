import { Modal as GeistModal, Note, Spacer, Text } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useWorkspaceActions } from '../../hooks/workspace.js'
import styles from './workspaceItem.module.scss'
import WorkspaceLabel from './WorkspaceLabel.jsx'

export default function LeaveWorkspaceModal({
  visible,
  setVisible,
  bindings,
  workspace,
}) {
  const { leaveWorkspace } = useWorkspaceActions()
  const handleLeavingWorkspace = useCallback(async () => {
    await leaveWorkspace(workspace._id)
    setVisible(false)
  }, [workspace._id])

  const { t } = useTranslation()
  return (
    <GeistModal visible={visible} {...bindings}>
      <WorkspaceLabel
        className={styles.workspaceLabel}
        color={workspace.color}
        name={workspace.name}
      />
      <h2>{t('workspace.leaveModal.title')}</h2>
      <GeistModal.Content>
        {t('workspace.leaveModal.confirm')}
        {workspace.stats.membersCount === 1 && (
          <>
            <Spacer h={1} />
            <Note label="Important" type="error">
              <Trans i18nKey="workspace.leaveModal.confirmDeletion">
                Lʼespace de travail sera <Text i>supprimé</Text> car vous êtes
                la dernière personne appartenant à cet espace.
              </Trans>
            </Note>
          </>
        )}
      </GeistModal.Content>
      <GeistModal.Action passive onClick={() => setVisible(false)}>
        {t('modal.cancelButton.text')}
      </GeistModal.Action>
      <GeistModal.Action onClick={handleLeavingWorkspace}>
        {t('modal.confirmButton.text')}
      </GeistModal.Action>
    </GeistModal>
  )
}
