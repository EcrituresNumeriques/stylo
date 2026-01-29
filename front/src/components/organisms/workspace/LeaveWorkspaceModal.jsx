import { CircleOff } from 'lucide-react'
import React, { useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { useWorkspaceActions } from '../../../hooks/workspace.js'
import { Alert, FormActions } from '../../molecules/index.js'

import Modal from '../../molecules/Modal.jsx'

import styles from './LeaveWorkspaceModal.module.scss'

export default function LeaveWorkspaceModal({ close, bindings, workspace }) {
  const { t } = useTranslation('workspace', { useSuspense: false })
  const { leaveWorkspace } = useWorkspaceActions()
  const handleLeavingWorkspace = useCallback(async () => {
    await leaveWorkspace(workspace._id)
  }, [workspace._id])

  const membersCount = workspace.stats?.membersCount ?? 0

  return (
    <Modal
      {...bindings}
      title={
        <>
          <CircleOff />
          {t('actions.leave.title')}
        </>
      }
    >
      {t('actions.leave.confirm')}
      {membersCount === 1 && (
        <Alert
          className={styles.message}
          type={'warning'}
          message={
            <Trans i18nKey="actions.leave.workspaceRemovalNote">
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
