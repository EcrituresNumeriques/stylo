import { create } from 'zustand'
import { request } from '../hooks/graphql.js'
import { getTags } from '../components/Tag.graphql'
import { applicationConfig } from './applicationConfig.jsx'
import { useSessionToken } from './authStore.jsx'

export const useTagStore = create((set) => ({
  tags: [],
  getTags: async () => {
    const sessionToken = useSessionToken()
    const { graphqlEndpoint } = applicationConfig
    const response = await request({
      query: getTags,
      variables: {},
      sessionToken,
      graphqlEndpoint,
    })
    set({ tags: await response.json() })
  },
  editTag: () => set((state) => ({ bears: state.bears + 1 })),
  addTag: () => set({ bears: 0 }),
}))
