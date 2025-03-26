import React, { useCallback } from 'react'
import { Note, Spacer, Text } from '@geist-ui/core'
import { Slash } from 'lucide-react'
import { Trans, useTranslation } from 'react-i18next'

import { useWorkspaceActions } from '../../hooks/workspace.js'

import Modal from '../Modal.jsx'
import FormActions from '../molecules/FormActions.jsx'
import WorkspaceLabel from './WorkspaceLabel.jsx'

import styles from './workspaceItem.module.scss'

export default function LeaveWorkspaceModal({ close, bindings, workspace }) {
  const { leaveWorkspace } = useWorkspaceActions()
  const handleLeavingWorkspace = useCallback(async () => {
    await leaveWorkspace(workspace._id)
    close()
  }, [workspace._id])

  const { t } = useTranslation()
  return (
    <Modal
      {...bindings}
      title={
        <>
          <Slash />
          {t('workspace.leaveModal.title')}
        </>
      }
    >
      <WorkspaceLabel
        className={styles.workspaceLabel}
        color={workspace.color}
        name={workspace.name}
      />
      {t('workspace.leaveModal.confirm')}
      {workspace.stats.membersCount === 1 && (
        <>
          <Spacer h={1} />
          <Note label="Important" type="error">
            <Trans i18nKey="workspace.leaveModal.confirmDeletion">
              Lʼespace de travail sera <Text i>supprimé</Text> car vous êtes la
              dernière personne appartenant à cet espace.
            </Trans>
          </Note>
        </>
      )}
      <FormActions onSubmit={handleLeavingWorkspace} onCancel={() => close()} />
    </Modal>
  )
}
