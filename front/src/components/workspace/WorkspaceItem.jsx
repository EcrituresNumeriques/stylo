import React, { useCallback, useEffect, useState } from 'react'
import { Slash, Users } from 'react-feather'
import { Modal as GeistModal, Button, Note, Text, Spacer } from '@geist-ui/core'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import TimeAgo from '../TimeAgo.jsx'

import styles from './workspaceItem.module.scss'
import { getWorkspace } from './Workspaces.graphql'
import WorkspaceLabel from './WorkspaceLabel.jsx'
import WorkspaceManageMembers from './WorkspaceManageMembers.jsx'
import { useGraphQL } from '../../helpers/graphQL.js'
import Field from '../Field.jsx'

export default function WorkspaceItem({ workspace }) {
  const { t } = useTranslation()
  const runQuery = useGraphQL()
  const dispatch = useDispatch()
  const [managingMembers, setManagingMembers] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [membersCount, setMembersCount] = useState(0)

  const handleCloseManagingMembers = useCallback(async () => {
    const response = await runQuery({
      query: getWorkspace,
      variables: { workspaceId: workspace._id },
    })
    setMembersCount(response.workspace.stats.membersCount)
    setManagingMembers(false)
  }, [workspace._id])

  const handleOpenManagingMembers = useCallback(() => {
    setManagingMembers(true)
  }, [workspace._id])

  const handleOpenLeaving = useCallback(() => {
    setLeaving(true)
  }, [workspace._id])

  const handleCloseLeaving = useCallback(() => {
    setLeaving(false)
  }, [workspace._id])

  const handleLeavingWorkspace = useCallback(
    () =>
      dispatch({
        type: 'LEAVE_WORKSPACE',
        data: { workspaceId: workspace._id },
      }),
    [workspace._id]
  )

  useEffect(() => {
    setMembersCount(workspace.stats?.membersCount || 0)
  }, [workspace.stats])

  const workspaceTitle = (
    <>
      <h5 className={styles.title}>
        <span
          className={styles.chip}
          style={{ backgroundColor: workspace.color }}
        ></span>
        <span className={styles.name}>{workspace.name}</span>
      </h5>
    </>
  )

  return (
    <div className={styles.container}>
      {workspaceTitle}
      {workspace.personal && (
        <>
          <Field className={styles.field} label="Articles">
            <span>{workspace.articlesCount}</span>
          </Field>
        </>
      )}
      {!workspace.personal && (
        <>
          <div>
            {workspace.description && (
              <Field
                className={styles.field}
                label={t('workspace.description.label')}
              >
                <span>{workspace.description}</span>
              </Field>
            )}
            <Field
              className={styles.field}
              label={t('workspace.createdAt.label')}
            >
              <>
                <TimeAgo date={workspace.createdAt} />
                {workspace.creator && (
                  <>
                    {' '}
                    <span>{t('workspace.createdBy.label')}</span>{' '}
                    <span className={styles.creator}>
                      {workspace.creator.displayName ||
                        workspace.creator.username}
                    </span>
                  </>
                )}
              </>
            </Field>
            <Field
              className={styles.field}
              label={t('workspace.updatedAt.label')}
            >
              <TimeAgo date={workspace.updatedAt} />
            </Field>
            <Field
              className={styles.field}
              label={t('workspace.membersCount.label')}
            >
              <span>{membersCount}</span>
            </Field>
            <Field
              className={styles.field}
              label={t('workspace.articlesCount.label')}
            >
              <span>{workspace.stats.articlesCount}</span>
            </Field>
          </div>
          <aside className={styles.actionButtons}>
            <Button
              className={styles.button}
              auto
              scale={0.8}
              icon={<Users />}
              title={t('workspace.manageMember.title')}
              onClick={handleOpenManagingMembers}
            >
              {t('workspace.manageMember.button')}
            </Button>
            <Button
              type="error-light"
              className={styles.button}
              ghost
              auto
              scale={0.5}
              icon={<Slash />}
              title={t('workspace.leave.title')}
              onClick={handleOpenLeaving}
            >
              {t('workspace.leave.button')}
            </Button>
          </aside>
          <GeistModal visible={leaving} onClose={handleCloseLeaving}>
            <WorkspaceLabel
              className={styles.workspaceLabel}
              color={workspace.color}
              name={workspace.name}
            />
            <h2>Quitter l'espace de travail</h2>
            <GeistModal.Content>
              Êtes-vous sûr de vouloir quitter cet espace de travail ?
              {workspace.stats.membersCount === 1 && (
                <>
                  <Spacer h={1} />
                  <Note label="Important" type="error">
                    L'espace de travail sera <Text i>supprimé</Text> car vous
                    êtes la dernière personne appartenant à cet espace.
                  </Note>
                </>
              )}
            </GeistModal.Content>
            <GeistModal.Action passive onClick={handleCloseLeaving}>
              {t('modal.cancelButton.text')}
            </GeistModal.Action>
            <GeistModal.Action onClick={handleLeavingWorkspace}>
              {t('modal.confirmButton.text')}
            </GeistModal.Action>
          </GeistModal>
          <GeistModal
            width="35rem"
            visible={managingMembers}
            onClose={handleCloseManagingMembers}
          >
            <WorkspaceLabel
              className={styles.workspaceLabel}
              color={workspace.color}
              name={workspace.name}
            />
            <h2>Gérer les membres de l'espace de travail</h2>
            <div className={styles.managingMembersSubtitle}>
              <div>Permet d'ajouter ou de supprimer un membre</div>
            </div>
            <GeistModal.Content>
              <WorkspaceManageMembers workspace={workspace} />
            </GeistModal.Content>
            <GeistModal.Action passive onClick={handleCloseManagingMembers}>
              {t('modal.close.text')}
            </GeistModal.Action>
          </GeistModal>
        </>
      )}
    </div>
  )
}
