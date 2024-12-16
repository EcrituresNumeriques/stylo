import { createContext, useContext } from 'react'

export const CurrentUserContext = createContext(null)

export function useCurrentUser() {
  return useContext(CurrentUserContext)
}
