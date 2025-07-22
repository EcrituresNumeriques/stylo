import { create } from 'zustand'

import { computeTextStats, computeTextStructure } from '../helpers/markdown.js'

export const useArticleStatsStore = create((set) => ({
  stats: {
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  },
  update: (text) => set({ stats: computeTextStats(text) }),
}))

export const useArticleStructureStore = create((set) => ({
  structure: [],
  update: (text) => set({ structure: computeTextStructure(text) }),
}))

export const useArticleRealTimeStore = create((set) => ({
  writers: {},
  update: (writers) => set({ writers }),
}))

export const useArticleStatusStore = create((set) => ({
  status: 'synced',
  update: (status) => set({ status }),
}))

export const useArticleEditorStore = create((set) => ({
  cursorPosition: {
    lineNumber: 0,
    column: 0,
  },
  updateCursorPosition: ({ lineNumber, column }) =>
    set({
      cursorPosition: {
        lineNumber,
        column,
      },
    }),
}))

export const useArticleFiltersStore = create((set) => ({
  filters: {
    selectedTagIds: [],
  },
  toggleTagId: (tagId) =>
    set((state) => {
      const selectedTagIds = state.filters.selectedTagIds
      return {
        filters: {
          ...state.filters,
          selectedTagIds: selectedTagIds.includes(tagId)
            ? selectedTagIds.filter((selectedTagId) => selectedTagId !== tagId)
            : [...selectedTagIds, tagId],
        },
      }
    }),
}))
