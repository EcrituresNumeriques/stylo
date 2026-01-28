import { CircleOff } from 'lucide-react'
import React, { useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { useWorkspaceActions } from '../../../hooks/workspace.js'
import { Alert, FormActions } from '../../molecules/index.js'

import Modal from '../../molecules/Modal.jsx'
import WorkspaceLabel from './WorkspaceLabel.jsx'

import styles from './workspaceItem.module.scss'

export default function LeaveWorkspaceModal({ close, bindings, workspace }) {
  const { leaveWorkspace } = useWorkspaceActions()
  const handleLeavingWorkspace = useCallback(async () => {
    await leaveWorkspace(workspace._id)
  }, [workspace._id])

  const { t } = useTranslation()
  return (
    <Modal
      {...bindings}
      title={
        <>
          <CircleOff />
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
        <Alert
          className={styles.message}
          type={'warning'}
          message={
            <Trans i18nKey="workspace.leaveModal.confirmDeletion">
              Lʼespace de travail sera <i>supprimé</i> car vous êtes la dernière
              personne appartenant à cet espace.
            </Trans>
          }
        />
      )}
      <FormActions onSubmit={handleLeavingWorkspace} onCancel={() => close()} />
    </Modal>
  )
}
