import React, { useCallback, useState } from 'react'

import styles from './workspaceItem.module.scss'
import { UserPlus, Users } from 'react-feather'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import CreateTag from '../CreateTag.jsx'

export default function WorkspaceItem({workspace}) {

  const [managingMembers, setManagingMembers] = useState(false)
  const handleCloseManagingMembers = useCallback(() => setManagingMembers(false), [])

  const workspaceTitle = (
    <>
      <h5 className={styles.title}>
        <span className={styles.chip} style={{backgroundColor: workspace.color}}></span>
        <span className={styles.name}>{workspace.name}</span>
      </h5>
    </>
  )
  return (<div className={styles.container}>
    {workspaceTitle}
    {workspace.personal && <>{workspace.articles.length} articles</> }
    {!workspace.personal && <>
      {workspace._id}

      <div>createdAt: </div>
      {workspace.createdAt}
      <div>updatedAt: </div>
      {workspace.updatedAt}
      {workspace.members.length}
      <aside className={styles.actionButtons}>
        {<Button title="Gérer les membres de l'espace" onClick={() => setManagingMembers(true)}>
          <Users/> Gérer les membres de l'espace
        </Button>}
      </aside>
      {managingMembers && (
        <Modal title="Liste des membres" cancel={handleCloseManagingMembers}>
          <table>
            <thead>
            <tr>
            <th>

            </th>
            <th>
              Nom
            </th>
              <th>
                Email
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td></td>
              <td>Guillaume</td>
              <td>ggrossetie@gmail.com</td>
            </tr>
            </tbody>
          </table>
          {<Button title="Inviter un membre" onClick={() => setManagingMembers(true)}>
            <UserPlus/> Inviter un membre
          </Button>}
        </Modal>
      )}
    </>}
  </div>)
}
