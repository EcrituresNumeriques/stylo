import { useSelector } from 'react-redux'
import { useSWRConfig } from 'swr'
import {
  getWorkspaceMembers,
  getWorkspaces,
  inviteMember as inviteMemberQuery,
  removeMember as removeMemberQuery,
} from '../components/workspace/Workspaces.graphql'
import WorkspaceService from '../services/WorkspaceService.js'
import useGraphQL, { useMutation, useSWRKey } from './graphql.js'

export function useActiveWorkspace() {
  return useSelector((state) => {
    const activeUser = state.activeUser
    if (activeUser === undefined) {
      return undefined
    }
    const activeWorkspaceId = activeUser.activeWorkspaceId
    return activeUser.workspaces?.find(
      (workspace) => workspace._id === activeWorkspaceId
    )
  })
}

export function useWorkspaceMembersActions(workspaceId) {
  const { mutate: workspacesMutate } = useSWRConfig()
  const key = useSWRKey()({ query: getWorkspaces })
  const mutation = useMutation()
  const { data, mutate, error, isLoading } = useGraphQL(
    { query: getWorkspaceMembers, variables: { workspaceId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const updateMembersCount = async (result) => {
    await workspacesMutate(key, async (data) => ({
      workspaces: data.workspaces.map((w) => {
        if (w._id === workspaceId) {
          return {
            ...w,
            stats: {
              ...w.stats,
              membersCount: result.workspace.members.length,
            },
          }
        } else {
          return w
        }
      }),
    }))
  }

  const removeMember = async (user) => {
    const { _id: userId } = user
    await mutation({
      query: removeMemberQuery,
      variables: { workspaceId, userId },
    })
    const result = await mutate(
      async (data) => {
        return {
          workspace: {
            members: data.workspace.members.filter((m) => m._id !== userId),
          },
        }
      },
      { revalidate: false }
    )
    await updateMembersCount(result)
  }

  const inviteMember = async (user) => {
    const { _id: userId } = user
    await mutation({
      query: inviteMemberQuery,
      variables: { workspaceId, userId, role: '' },
    })
    const result = await mutate(
      async (data) => {
        return {
          workspace: {
            members: [user, ...data.workspace.members],
          },
        }
      },
      { revalidate: false }
    )
    await updateMembersCount(result)
  }

  return {
    error,
    isLoading,
    members:
      data?.workspace?.members?.map((member) => ({
        ...member,
        selected: true,
      })) || [],
    inviteMember,
    removeMember,
  }
}

export function useWorkspaceActions() {
  const { mutate } = useSWRConfig()
  const key = useSWRKey()({ query: getWorkspaces })
  const sessionToken = useSelector((state) => state.sessionToken)
  const workspaceService = new WorkspaceService(sessionToken)
  const addWorkspace = async (workspace) => {
    await workspaceService.create({
      color: workspace.color,
      description: workspace.description,
      name: workspace.name,
    })
    mutate(key, async (data) => ({
      workspaces: [workspace, ...data.workspaces],
    }))
  }

  const leaveWorkspace = async (workspaceId) => {
    await workspaceService.leave(workspaceId)
    mutate(
      key,
      async (data) => ({
        workspaces: data.workspaces.filter((w) => w._id !== workspaceId),
      }),
      { revalidate: false }
    )
  }

  return {
    addWorkspace,
    leaveWorkspace,
  }
}

export function useWorkspaces() {
  const { data, error, isLoading } = useGraphQL({
    query: getWorkspaces,
  })

  return {
    workspaces: data?.workspaces,
    error,
    isLoading,
  }
}
