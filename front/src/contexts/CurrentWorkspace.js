import { createContext, useContext } from 'react'

export const CurrentWorkspaceContext = createContext(null)

export function useCurrentWorkspace () {
  return useContext(CurrentWorkspaceContext)
}
