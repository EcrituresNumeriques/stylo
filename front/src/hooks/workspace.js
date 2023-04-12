import { useSelector } from 'react-redux'

export function useActiveWorkspace () {
  return useSelector((state) => {
    const activeUser = state.activeUser
    return activeUser.workspaces.find((workspace) => workspace._id === activeUser.activeWorkspaceId)
  })
}
