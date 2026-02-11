import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useDisplayName } from '../../../hooks/user.js'
import { useWorkspaceMembersActions } from '../../../hooks/workspace.js'
import { Alert, Loading } from '../../molecules/index.js'

import ContactSearch from '../contact/ContactSearch.jsx'

export default function WorkspaceManageMembers({ workspace }) {
  const { t } = useTranslation('workspace', { useSuspense: false })
  const displayName = useDisplayName()
  const workspaceId = workspace._id
  const { members, error, isLoading, inviteMember, removeMember } =
    useWorkspaceMembersActions(workspaceId)

  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      if (action === 'select') {
        try {
          await inviteMember(user)
          toast(
            t('actions.share.add.success', { displayName: displayName(user) }),
            {
              type: 'info',
            }
          )
        } catch (err) {
          toast(t('actions.share.add.error', { errMessage: err }), {
            type: 'error',
          })
        }
      } else if (action === 'unselect') {
        try {
          await removeMember(user)
          toast(
            t('actions.share.remove.success', {
              displayName: displayName(user),
            }),
            {
              type: 'warning',
            }
          )
        } catch (err) {
          toast(t('actions.share.remove.error', { errMessage: err }), {
            type: 'error',
          })
        }
      }
    },
    [workspaceId]
  )

  if (error) {
    return <Alert message={error.message} />
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
