import { useSelector } from 'react-redux'

export function useActiveWorkspace () {
  return useSelector((state) => {
    const activeUser = state.activeUser
    if (activeUser === undefined) {
      return undefined
    }
    const activeWorkspaceId = activeUser.activeWorkspaceId
    return activeUser.workspaces?.find((workspace) => workspace._id === activeWorkspaceId)
  })
}
