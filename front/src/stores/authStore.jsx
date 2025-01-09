import { createStore, useStore } from 'zustand'
import { devtools } from 'zustand/middleware'

const { SNOWPACK_SESSION_STORAGE_ID: sessionTokenName = 'sessionToken' } =
  import.meta.env

export const authStore = createStore()(
  devtools(
    (set, get) => ({
      sessionToken: localStorage.getItem(sessionTokenName),
      actions: {
        init: () => {
          const authToken = new URLSearchParams(location.hash).get(
            '#auth-token'
          )
          if (authToken) {
            const { setToken } = get().actions
            setToken(authToken)
            window.history.replaceState({}, '', location.pathname)
          }
        },
        setToken: (sessionToken) => {
          localStorage.setItem(sessionTokenName, sessionToken)
          set({
            sessionToken: sessionToken,
          })
        },
        logout: () => {
          localStorage.removeItem(sessionTokenName)
          set({
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

const sessionTokenSelector = (state) => state.sessionToken
const actionsSelector = (state) => state.actions

export const getSessionToken = () => sessionTokenSelector(authStore.getState())
export const useSessionToken = () => useAuthStore(sessionTokenSelector)
export const getActions = () => actionsSelector(authStore.getState())
