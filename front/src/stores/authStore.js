import { create } from 'zustand'

const sessionTokenName = 'sessionToken'

export const useAuthStore = create((set) => ({
  sessionToken: localStorage.getItem(sessionTokenName),
  update: (sessionToken) =>
    set(() => {
      localStorage.setItem(sessionTokenName, sessionToken)
      return { sessionToken }
    }),
  logout: () => {
    return set(() => {
      localStorage.removeItem(sessionTokenName)
      return {
        sessionToken: null,
      }
    })
  },
}))
