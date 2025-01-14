import * as Sentry from '@sentry/react'
import { useSelector } from 'react-redux'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import { runQuery } from '../helpers/graphQL.js'
import { getFullUserProfile } from '../components/Credentials.graphql'
import { applicationConfig } from './applicationConfig.jsx'

const workspacePathsRx = /^\/workspaces\/(?<id>[a-z0-9]+)\/(?:articles|books)$/

const { SNOWPACK_SESSION_STORAGE_ID: sessionTokenName = 'sessionToken' } =
  import.meta.env

/**
 *
 * @param sessionToken
 * @return {Promise<{user:{}}>}
 */
function getUserProfile(sessionToken) {
  const { graphqlEndpoint } = applicationConfig
  return runQuery(
    { graphqlEndpoint, sessionToken },
    { query: getFullUserProfile }
  )
}

function extractWorkspaceIdFromLocation() {
  const pathname = location.pathname
  const workspacePathRxResult = pathname.match(workspacePathsRx)
  if (workspacePathRxResult) {
    return workspacePathRxResult.groups.id
  }
}

export const authStore = createStore()(
  devtools(
    (set, get) => ({
      sessionToken: localStorage.getItem(sessionTokenName),
      activeUser: null,
      actions: {
        init: async () => {
          const sessionToken = new URLSearchParams(location.hash).get(
            '#auth-token'
          )
          const currentSessionToken = get().sessionToken ?? sessionToken
          if (currentSessionToken) {
            const { setToken } = get().actions
            await setToken(currentSessionToken)
          }
        },
        setActiveWorkspaceId: (activeWorkspaceId) => {
          const activeUser = get().activeUser
          if (activeUser) {
            set({
              activeUser: {
                ...activeUser,
                activeWorkspaceId,
              },
            })
          }
        },
        setToken: async (sessionToken) => {
          const { login, logout } = get().actions
          try {
            const response = await getUserProfile(sessionToken)
            const activeWorkspaceId = extractWorkspaceIdFromLocation()
            login({ ...response.user, activeWorkspaceId }, sessionToken)
            window.history.replaceState({}, '', location.pathname)
          } catch (error) {
            console.log('User seemingly not authenticated: %s', error.message)
            logout()
          }
        },
        login: (user, sessionToken) => {
          Sentry.setUser({ id: user._id })
          localStorage.setItem(sessionTokenName, sessionToken)
          set({
            sessionToken: sessionToken,
            activeUser: {
              ...user,
              // dates are expected to be in timestamp string format (including milliseconds)
              createdAt: new Date(user.createdAt).getTime(),
              updatedAt: new Date(user.updatedAt).getTime(),
            },
          })
        },
        logout: () => {
          Sentry.setUser(null)
          localStorage.removeItem(sessionTokenName)
          set({
            activeUser: null,
            sessionToken: undefined,
            sessionTokenData: undefined,
          })
        },
      },
    }),
    {
      name: 'auth-store',
      enabled: !import.meta.env.PROD,
    }
  )
)

export function useAuthStore(selector) {
  return useStore(authStore, selector)
}

const activeUserIdSelector = (state) => state.activeUser._id
const activeUserSelector = (state) => state.activeUser
const sessionTokenSelector = (state) => state.sessionToken
const actionsSelector = (state) => state.actions

export const useActiveUser = () => useAuthStore(activeUserSelector)
export const useActiveUserId = () => useAuthStore(activeUserIdSelector)
export const useSessionToken = () => useAuthStore(sessionTokenSelector)
export const getActions = () => actionsSelector(authStore.getState())
// REMIND: we might want to use a dedicated store to manage workspaces
export const useActiveWorkspace = () =>
  useAuthStore((state) => {
    const activeUser = state.activeUser
    const activeWorkspaceId = activeUser?.activeWorkspaceId
    if (activeWorkspaceId) {
      return activeUser.workspaces?.find(
        (workspace) => workspace._id === activeWorkspaceId
      )
    }
    return undefined
  })
