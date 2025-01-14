import * as Sentry from '@sentry/react'
import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'

import { runQuery } from '../helpers/graphQL.js'
import { getFullUserProfile } from '../components/Credentials.graphql'
import { applicationConfig } from './applicationConfig.jsx'
import { workspaceStore } from './workspaceStore.jsx'

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
        clearZoteroToken: () => {
          const activeUser = get().activeUser
          if (activeUser) {
            set({
              activeUser: {
                ...activeUser,
                zoteroToken: null,
              },
            })
          }
        },
        updateActiveUser: (value) => {
          const activeUser = get().activeUser
          if (activeUser) {
            set({
              activeUser: {
                ...activeUser,
                ...value,
              },
            })
          }
        },
        setToken: async (sessionToken) => {
          const { login, logout } = get().actions
          try {
            const response = await getUserProfile(sessionToken)
            login({ ...response.user }, sessionToken)
            window.history.replaceState({}, '', location.pathname)
          } catch (error) {
            console.log('User seemingly not authenticated: %s', error.message)
            logout()
          }
        },
        login: (user, sessionToken) => {
          Sentry.setUser({ id: user._id })
          localStorage.setItem(sessionTokenName, sessionToken)
          const { workspaces, ...userInfo } = user
          workspaceStore.getState().actions.setWorkspaces(workspaces)
          set({
            sessionToken: sessionToken,
            activeUser: {
              ...userInfo,
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
