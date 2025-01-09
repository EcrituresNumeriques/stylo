import { shallowEqual, useSelector } from 'react-redux'
import { create } from 'zustand'
import { request } from '../hooks/graphql.js'
import { getTags } from '../components/Tag.graphql'

export const useTagStore = create((set) => ({
  tags: [],
  getTags: async () => {
    const sessionToken = useSelector((state) => state.sessionToken)
    const graphqlEndpoint = useSelector(
      (state) => state.applicationConfig.graphqlEndpoint,
      shallowEqual
    )
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
