import React, { useCallback, useEffect, useState } from 'react'
import { Slash, Users } from 'react-feather'
import { Modal as GeistModal, Button } from '@geist-ui/core'

import styles from './workspaceItem.module.scss'
import { getWorkspace } from './Workspaces.graphql'
import WorkspaceLabel from './WorkspaceLabel.jsx'
import WorkspaceManageMembers from './WorkspaceManageMembers.jsx'
import { useGraphQL } from '../../helpers/graphQL.js'
import Field from '../Field.jsx'
import formatTimeAgo from '../../helpers/formatTimeAgo.js'

export default function WorkspaceItem ({ workspace }) {

  const runQuery = useGraphQL()
  const [managingMembers, setManagingMembers] = useState(false)
  const handleCloseManagingMembers = useCallback(async () => {
    const response = await runQuery({ query: getWorkspace, variables: { workspaceId: workspace._id } })
    setMembersCount(response.workspace.stats.membersCount)
    setManagingMembers(false)
  }, [workspace._id])

  const [membersCount, setMembersCount] = useState(0)

  useEffect(() => {
    setMembersCount(workspace.stats?.membersCount || 0)
  }, [workspace.stats])

  const workspaceTitle = (
    <>
      <h5 className={styles.title}>
        <span className={styles.chip} style={{ backgroundColor: workspace.color }}></span>
        <span className={styles.name}>{workspace.name}</span>
      </h5>
    </>
  )
  return (<div className={styles.container}>
    {workspaceTitle}
    {workspace.personal && <>
      <Field className={styles.field} label="Articles">
        <span>{workspace.articles.length}</span>
      </Field>
    </>}
    {!workspace.personal && <>
      <div>
        <Field className={styles.field} label="Created">
          <time dateTime={workspace.createdAt}>{formatTimeAgo(workspace.createdAt)}</time>
        </Field>
        <Field className={styles.field} label="Updated">
          <time dateTime={workspace.updatedAt}>{formatTimeAgo(workspace.updatedAt)}</time>
        </Field>
        <Field className={styles.field} label="Membres">
          <span>{membersCount}</span>
        </Field>
        <Field className={styles.field} label="Articles">
          <span>{workspace.stats.articlesCount}</span>
        </Field>
      </div>
      <aside className={styles.actionButtons}>
        <Button className={styles.button} auto scale={.8} icon={<Users/>} title="Gérer les membres de l'espace"
                 onClick={() => setManagingMembers(true)}>
          Gérer les membres de l'espace
        </Button>
        <Button type='error-light' className={styles.button} ghost auto scale={.5} icon={<Slash/>} title="Quitter l'espace de travail">
          Quitter l'espace de travail
        </Button>
      </aside>
      <GeistModal width="35rem" visible={managingMembers} onClose={handleCloseManagingMembers}>
        <WorkspaceLabel className={styles.workspaceLabel} color={workspace.color} name={workspace.name}/>
        <h2>Gérer les membres de l'espace de travail</h2>
        <div className={styles.managingMembersSubtitle}>
          <div>Permet d'ajouter ou de supprimer un membre</div>
        </div>
        <GeistModal.Content>
          <WorkspaceManageMembers workspace={workspace}/>
        </GeistModal.Content>
        <GeistModal.Action passive onClick={handleCloseManagingMembers}>Fermer</GeistModal.Action>
      </GeistModal>
    </>}
  </div>)
}
