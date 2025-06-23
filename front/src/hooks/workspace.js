import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { executeQuery } from '../helpers/graphQL.js'
import useFetchData, { useMutateData } from './graphql.js'

import {
  create as createMutation,
  getWorkspaceMembers,
  getWorkspaces,
  inviteMember as inviteMemberMutation,
  leave as leaveMutation,
  removeMember as removeMemberMutation,
} from '../components/workspace/Workspaces.graphql'

export function useActiveWorkspaceId() {
  const { workspaceId } = useParams()

  return workspaceId
}

export function useWorkspaceMembersActions(workspaceId) {
  const { mutate: workspacesMutate } = useMutateData({
    query: getWorkspaces,
  })
  const sessionToken = useSelector((state) => state.sessionToken)
  const { data, mutate, error, isLoading } = useFetchData(
    { query: getWorkspaceMembers, variables: { workspaceId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const updateMembersCount = async (result) => {
    await workspacesMutate(async (data) => ({
      workspaces: data?.workspaces?.map((w) => {
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
    await executeQuery({
      query: removeMemberMutation,
      variables: { workspaceId, userId },
      sessionToken,
      type: 'mutation',
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
    await executeQuery({
      query: inviteMemberMutation,
      variables: { workspaceId, userId },
      sessionToken,
      type: 'mutation',
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
  const { mutate } = useMutateData({ query: getWorkspaces })
  const sessionToken = useSelector((state) => state.sessionToken)
  const addWorkspace = async (workspace) => {
    const result = await executeQuery({
      sessionToken,
      query: createMutation,
      variables: {
        data: {
          color: workspace.color,
          description: workspace.description,
          name: workspace.name,
        },
      },
    })
    await mutate(
      async (data) => ({
        workspaces: [result.createWorkspace, ...data.workspaces],
      }),
      { revalidate: false }
    )
  }

  const leaveWorkspace = async (workspaceId) => {
    await executeQuery({
      sessionToken,
      query: leaveMutation,
      variables: {
        workspaceId,
      },
    })
    await mutate(
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
  const { data, error, isLoading } = useFetchData({
    query: getWorkspaces,
  })

  return {
    workspaces: data?.workspaces,
    error,
    isLoading,
  }
}
