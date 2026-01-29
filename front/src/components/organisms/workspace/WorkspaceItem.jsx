import { Newspaper, UserPlus, Users } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useModal } from '../../../hooks/modal.js'
import { useDisplayName } from '../../../hooks/user.js'
import { Button } from '../../atoms/index.js'
import { DropdownMenu, ObjectMetadataLabel } from '../../molecules/index.js'

import LeaveWorkspaceModal from './LeaveWorkspaceModal.jsx'
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
import WorkspaceManageMembersModal from './WorkspaceManageMembersModal.jsx'
import WorkspaceUpdateFormMetadataModal from './WorkspaceUpdateFormMetadataModal.jsx'

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
import styles from './WorkspaceItem.module.scss'

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
  const { t } = useTranslation('workspace', { useSuspense: false })
  const displayName = useDisplayName()
  const workspaceLeaveModal = useModal()
  const workspaceManageMembersModal = useModal()
  const workspaceUpdateFormMetadataModal = useModal()

  const articlesCount = workspace.personal
    ? workspace.articlesCount
    : workspace.stats.articlesCount

  const membersCount = workspace.personal ? 0 : workspace.stats.membersCount

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title} id={`workspace-${workspace._id}-title`}>
            <span
              className={styles.chip}
              style={{ backgroundColor: workspace.color }}
              role="presentation"
            ></span>
            {workspace.name}
          </h2>
        </div>

        {!workspace.personal && (
          <div role="menu" className={styles.actionButtons}>
            <Button
              role="menuitem"
              icon={true}
              title={t('actions.share.title')}
              onClick={() => workspaceManageMembersModal.show()}
            >
              <UserPlus aria-label={t('actions.share.label')} />
            </Button>

            <DropdownMenu title={t('actions.menu.title')}>
              <ul>
                <li
                  onClick={() => workspaceUpdateFormMetadataModal.show()}
                  title={t('actions.metadata.title')}
                >
                  {t('actions.metadata.label')}
                </li>
                <li
                  onClick={() => workspaceLeaveModal.show()}
                  title={t('actions.leave.title')}
                >
                  {t('actions.leave.label')}
                </li>
              </ul>
            </DropdownMenu>
          </div>
        )}
      </header>

      <section className={styles.details}>
        {workspace.description && <p>{workspace.description}</p>}

        <div className={styles.counters}>
          <div className={styles.counter}>
            <Newspaper /> {t('stats.articles', { count: articlesCount })}
          </div>
          {membersCount > 0 && (
            <div className={styles.counter}>
              <Users /> {t('stats.members', { count: membersCount })}
            </div>
          )}
        </div>

        {!workspace.personal && (
          <ObjectMetadataLabel
            className={styles.metadata}
            creatorName={displayName(workspace.creator)}
            updatedAtDate={workspace.updatedAt}
          />
        )}
      </section>

      <LeaveWorkspaceModal {...workspaceLeaveModal} workspace={workspace} />

      <WorkspaceManageMembersModal
        {...workspaceManageMembersModal}
        workspace={workspace}
      />

      <WorkspaceUpdateFormMetadataModal
        {...workspaceUpdateFormMetadataModal}
        workspace={workspace}
      />
    </article>
  )
}
