import React, { useCallback } from 'react'
import { useToasts } from '@geist-ui/core'
import useGraphQL, { useMutation } from '../../hooks/graphql.js'

import {
  getWorkspaceMembers,
  inviteMember,
  removeMember,
} from './Workspaces.graphql'
import ContactSearch from '../ContactSearch.jsx'

export default function WorkspaceManageMembers({ workspace }) {
  const workspaceId = workspace._id
  const mutation = useMutation()
  const { setToast } = useToasts()
  const { data, mutate } = useGraphQL({
    query: getWorkspaceMembers,
    variables: { workspaceId },
  })
  const members =
    data?.workspace?.members?.map((member) => ({
      ...member,
      selected: true,
    })) || []

  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      const { _id: userId } = user
      if (action === 'select') {
        try {
          const response = await mutation({
            query: inviteMember,
            variables: { workspaceId, userId, role: '' },
          })
          await mutate(
            {
              workspace: {
                members: response.workspace.inviteMember.members.map(
                  (member) => ({
                    ...member,
                    selected: true,
                  })
                ),
              },
            },
            { revalidate: false }
          )
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
          const response = await mutation({
            query: removeMember,
            variables: { workspaceId, userId },
          })
          await mutate(
            {
              workspace: {
                members: response.workspace.member.remove.members.map(
                  (member) => ({
                    ...member,
                    selected: true,
                  })
                ),
              },
            },
            { revalidate: false }
          )
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
