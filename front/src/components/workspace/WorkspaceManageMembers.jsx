import React, { useCallback, useEffect, useState } from 'react'
import { useToasts } from '@geist-ui/core'

import { getWorkspaceMembers, inviteMember, removeMember } from './Workspaces.graphql'
import { useGraphQL } from '../../helpers/graphQL.js'
import ContactSearch from '../ContactSearch.jsx'


export default function WorkspaceManageMembers ({ workspace }) {
  const { setToast } = useToasts()
  const runQuery = useGraphQL()
  const [members, setMembers] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const getWorkspaceMembersResponse = await runQuery({
          query: getWorkspaceMembers,
          variables: { workspaceId: workspace._id }
        })
        const members = getWorkspaceMembersResponse.workspace.members
        setMembers(members.map((member) => ({
          ...member,
          selected: true
        })))
      } catch (err) {
        alert(err)
      }
    })()
  }, [workspace._id])

  const handleUserUpdated = useCallback(async ({ user, action }) => {
    const { _id: userId } = user
    if (action === 'select') {
      try {
        await runQuery({
          query: inviteMember,
          variables: { workspaceId: workspace._id, userId, role: '' }
        })
        setToast({
          text: `Utilisateur ${user.displayName || user.username} invité en tant que membre.`,
          type: 'default',
        })
      } catch (err) {
        setToast({
          text: err,
          type: 'error',
        })
      }
    } else if (action === 'unselect') {
      try {
        await runQuery({
          query: removeMember,
          variables: { workspaceId: workspace._id, userId }
        })
        setToast({
          text: `Utilisateur ${user.displayName || user.username} supprimé des membres.`,
          type: 'warning',
        })
      } catch (err) {
        setToast({
          text: err,
          type: 'error',
        })
      }
    }
  }, [workspace._id])

  return (
    <section>
      <ContactSearch
        onUserUpdated={handleUserUpdated}
        members={members}
      />
    </section>
  )
}
