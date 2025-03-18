import { useToasts } from '@geist-ui/core'
import React, { useCallback } from 'react'
import { useWorkspaceMembersActions } from '../../hooks/workspace.js'
import ContactSearch from '../ContactSearch.jsx'
import Loading from '../molecules/Loading.jsx'

export default function WorkspaceManageMembers({ workspace }) {
  const workspaceId = workspace._id
  const { setToast } = useToasts()
  const { members, error, isLoading, inviteMember, removeMember } =
    useWorkspaceMembersActions(workspaceId)

  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      if (action === 'select') {
        try {
          await inviteMember(user)
          setToast({
            text: `Utilisateur ${
              user.displayName || user.username
            } invité en tant que membre.`,
            type: 'default',
          })
        } catch (err) {
          setToast({
            text: String(err),
            type: 'error',
          })
        }
      } else if (action === 'unselect') {
        try {
          await removeMember(user)
          setToast({
            text: `Utilisateur ${
              user.displayName || user.username
            } supprimé des membres.`,
            type: 'warning',
          })
        } catch (err) {
          setToast({
            text: String(err),
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
