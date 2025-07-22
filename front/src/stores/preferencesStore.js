import { create } from 'zustand'

import { persist } from 'zustand/middleware'

// FIXME: migrate localStorage and use a single store for all preferences.
// Zustand is using the following format: {state: {}, version: 0}

export const useArticlePreferences = create()(
  persist(
    (set) => ({
      expandSidebarRight: true,
      activePanel: null,
      metadataFormMode: 'basic',
      update: (data) => set({ ...data }),
      setValue: (key, value) =>
        set((state) => {
          return { ...state, [key]: value === undefined ? !state[key] : value }
        }),
    }),
    {
      name: 'articlePreferences',
    }
  )
)

export const useExportPreferences = create()(
  persist(
    (set) => ({
      bibliography_style: 'chicagomodified',
      with_toc: 0,
      link_citations: 0,
      with_nocite: 0,
      formats: 'html',
      unnumbered: 0,
      book_division: 'part',
      update: (data) => set({ ...data }),
      setValue: (key, value) =>
        set((state) => {
          return { ...state, [key]: value === undefined ? !state[key] : value }
        }),
    }),
    {
      name: 'exportPreferences',
    }
  )
)

export const useUserPreferences = create()(
  persist(
    (set) => ({
      trackingConsent: true /* default value should be false */,
      setValue: (key, value) =>
        set((state) => {
          return { ...state, [key]: value === undefined ? !state[key] : value }
        }),
    }),
    {
      name: 'userPreferences',
    }
  )
)

export const useCorpusPreferences = create()(
  persist(
    (set) => ({
      metadataFormMode: 'basic',
      update: (data) => set({ ...data }),
      setValue: (key, value) =>
        set((state) => {
          return { ...state, [key]: value === undefined ? !state[key] : value }
        }),
    }),
    {
      name: 'corpusPreferences',
    }
  )
)
