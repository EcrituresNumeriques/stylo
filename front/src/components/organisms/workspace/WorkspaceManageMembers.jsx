import React, { useCallback } from 'react'
import { toast } from 'react-toastify'

import { useWorkspaceMembersActions } from '../../../hooks/workspace.js'
import { Loading } from '../../molecules/index.js'

import ContactSearch from '../contact/ContactSearch.jsx'

export default function WorkspaceManageMembers({ workspace }) {
  const workspaceId = workspace._id
  const { members, error, isLoading, inviteMember, removeMember } =
    useWorkspaceMembersActions(workspaceId)

  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      if (action === 'select') {
        try {
          await inviteMember(user)
          toast(
            `Utilisateur ${
              user.displayName || user.username
            } invité en tant que membre.`,
            {
              type: 'info',
            }
          )
        } catch (err) {
          toast(String(err), {
            type: 'error',
          })
        }
      } else if (action === 'unselect') {
        try {
          await removeMember(user)
          toast(
            `Utilisateur ${
              user.displayName || user.username
            } supprimé des membres.`,
            {
              type: 'warning',
            }
          )
        } catch (err) {
          toast(String(err), {
            type: 'error',
          })
        }
      }
    },
    [workspaceId]
  )

  if (error) {
    return <div>Unable to load workspace members</div>
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <section>
      <ContactSearch
        onUserUpdated={handleUserUpdated}
        members={members}
        showActiveUser
      />
    </section>
  )
}
