import { Braces, CircleOff, Users } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useModal } from '../../hooks/modal.js'

import Button from '../Button.jsx'
import Field from '../Field.jsx'
import TimeAgo from '../TimeAgo.jsx'
import LeaveWorkspaceModal from './LeaveWorkspaceModal.jsx'
import WorkspaceManageMembersModal from './WorkspaceManageMembersModal.jsx'
import WorkspaceUpdateFormMetadataModal from './WorkspaceUpdateFormMetadataModal.jsx'

import styles from './workspaceItem.module.scss'

/**
 * @typedef {Object} WorkspaceItemProps
 * @property {{
 *   color: string,
 *   name: string,
 *   description: string,
 *   personal: boolean,
 *   articlesCount: number,
 *   creator: {
 *     displayName: string,
 *     username: string
 *   },
 *   formMetadata: {
 *     data: string,
 *     ui: string
 *   },
 *   createdAt: string,
 *   updatedAt: string
 * }} workspace
 */

/**
 * @param {WorkspaceItemProps} props
 * @returns {React.ReactHTMLElement}
 */
export default function WorkspaceItem({ workspace }) {
  const { t } = useTranslation()
  const workspaceLeaveModal = useModal()
  const workspaceManageMembersModal = useModal()
  const workspaceUpdateFormMetadataModal = useModal()

  const workspaceTitle = (
    <>
      <h2 className={styles.title}>
        <span
          className={styles.chip}
          style={{ backgroundColor: workspace.color }}
          role="presentation"
        ></span>

        <span>{workspace.name}</span>
      </h2>
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
              <span>{workspace.stats.membersCount}</span>
            </Field>
            <Field
              className={styles.field}
              label={t('workspace.articlesCount.label')}
            >
              <span>{workspace.stats.articlesCount}</span>
            </Field>
          </div>
          <aside className={styles.actionButtons}>
            <div className={styles.primaryActionButtons}>
              <Button
                title={t('workspace.manageMember.title')}
                onClick={() => workspaceManageMembersModal.show()}
              >
                <Users /> {t('workspace.manageMember.button')}
              </Button>
              <Button
                title={t('workspace.updateFormMetadata.title')}
                onClick={() => workspaceUpdateFormMetadataModal.show()}
              >
                <Braces /> {t('workspace.updateFormMetadata.button')}
              </Button>
            </div>
            <Button
              title={t('workspace.leave.title')}
              onClick={() => workspaceLeaveModal.show()}
            >
              <CircleOff /> {t('workspace.leave.button')}
            </Button>
          </aside>

          <LeaveWorkspaceModal {...workspaceLeaveModal} workspace={workspace} />

          <WorkspaceManageMembersModal
            {...workspaceManageMembersModal}
            workspace={workspace}
          />

          <WorkspaceUpdateFormMetadataModal
            {...workspaceUpdateFormMetadataModal}
            workspace={workspace}
          />
        </>
      )}
    </div>
  )
}
