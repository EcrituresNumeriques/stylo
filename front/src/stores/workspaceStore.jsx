import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import WorkspaceService from '../services/WorkspaceService.js'
import { applicationConfig } from './applicationConfig.jsx'
import { authStore } from './authStore.jsx'

const workspacePathsRx = /^\/workspaces\/(?<id>[a-z0-9]+)\/(?:articles|books)$/

function extractWorkspaceIdFromLocation() {
  const pathname = location.pathname
  const workspacePathRxResult = pathname.match(workspacePathsRx)
  if (workspacePathRxResult) {
    return workspacePathRxResult.groups.id
  }
}

export const workspaceStore = createStore()(
  devtools(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      actions: {
        init: () => {
          const activeWorkspaceId = extractWorkspaceIdFromLocation()
          get().actions.setActiveWorkspaceId(activeWorkspaceId)
        },
        setWorkspaces: (workspaces) => {
          set({
            workspaces,
          })
        },
        createWorkspace: async (data) => {
          const { sessionToken } = authStore.getState()
          const workspaceService = new WorkspaceService(
            sessionToken,
            applicationConfig
          )
          const response = await workspaceService.create(data)
          const current = get()
          const workspaces = current.workspaces
          current.actions.setWorkspaces([
            response.createWorkspace,
            ...workspaces,
          ])
        },
        leaveWorkspace: async (workspaceId) => {
          const { sessionToken } = authStore.getState()
          const workspaceService = new WorkspaceService(
            sessionToken,
            applicationConfig
          )
          await workspaceService.leave(workspaceId)
          const current = get()
          const workspaces = current.workspaces
          current.actions.setWorkspaces(
            workspaces.filter((w) => w._id !== workspaceId)
          )
        },
        setActiveWorkspaceId: (activeWorkspaceId) => {
          set({
            activeWorkspaceId,
          })
        },
      },
    }),
    {
      name: 'workspace-store',
      enabled: !import.meta.env.PROD,
    }
  )
)

export function useWorkspaceStore(selector) {
  return useStore(workspaceStore, selector)
}

const workspacesSelector = (state) => state.workspaces
const actionsSelector = (state) => state.actions

export const useWorkspaces = () => useWorkspaceStore(workspacesSelector)
export const getActions = () => actionsSelector(workspaceStore.getState())

export const useActiveWorkspace = () =>
  useWorkspaceStore((state) => {
    const activeWorkspaceId = state.activeWorkspaceId
    if (activeWorkspaceId) {
      return state.workspaces?.find(
        (workspace) => workspace._id === activeWorkspaceId
      )
    }
    return undefined
  })
