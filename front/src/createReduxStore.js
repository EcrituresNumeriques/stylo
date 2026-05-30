import { createReduxEnhancer as createSentryReduxEnhancer } from '@sentry/react'

import { applyMiddleware, compose, createStore } from 'redux'

const sessionTokenName = 'sessionToken'

/**
 * @typedef {object} ExportPreferences
 * @property {string} bibliography_style
 * @property {0 | 1} with_toc
 * @property {0 | 1} link_citations
 * @property {0 | 1} with_nocite
 * @property {'originals' | 'md-ssg' | 'html' | 'tex' | 'pdf' | 'odt' | 'docx' | 'icml' | 'xml-tei' | 'xml-erudit' | 'xml-tei-metopes'} formats
 * @property {0 | 1} unnumbered
 * @property {'part' | 'chapter'} book_division
 */

/**
 * @typedef {object} UserPreferences
 * @property {boolean} trackingConsent
 * @property {string|null} workspaceId
 */

// Définition du store Redux et de l'ensemble des actions
export const initialState = {
  sessionToken: localStorage.getItem(sessionTokenName),
  articlePreferences: localStorage.getItem('articlePreferences')
    ? JSON.parse(localStorage.getItem('articlePreferences'))
    : {
        expandSidebarRight: true,
        activePanel: null,
        metadataFormMode: 'basic',
      },
  articleFilters: {
    tagIds: [],
    text: '',
  },
  // Active user (authenticated)
  activeUser: {
    authTypes: [],
    authProviders: {},
    selectedTagIds: [],
  },
  /** @type {UserPreferences} */
  userPreferences: localStorage.getItem('userPreferences')
    ? JSON.parse(localStorage.getItem('userPreferences'))
    : {
        trackingConsent: true /* default value should be false */,
        workspaceId: null,
      },
  /** @type {ExportPreferences} */
  exportPreferences: localStorage.getItem('exportPreferences')
    ? JSON.parse(localStorage.getItem('exportPreferences'))
    : {
        bibliography_style: 'chicagomodified',
        with_toc: 0,
        link_citations: 0,
        with_nocite: 0,
        formats: 'html',
        unnumbered: 0,
        book_division: 'part',
      },
}

/**
 *
 * @param {unknown} initialState
 * @param {Record<string, unknown>} handlers
 * @returns {(state: unknown, action: {type: string}) => unknown}
 */
function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (Object.hasOwn(handlers, action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

/**
 *
 * @param {unknown} state
 * @returns {(state: unknown, action: {type: string}) => unknown}
 */
function createRootReducer(state) {
  return createReducer(state, {
    PROFILE: setProfile,
    LOGIN: loginUser,
    UPDATE_SESSION_TOKEN: setSessionToken,
    UPDATE_ACTIVE_USER_DETAILS: updateActiveUserDetails,
    LOGOUT: logoutUser,

    // user preferences reducers
    ARTICLE_PREFERENCES_TOGGLE: toggleArticlePreferences,
    CORPUS_PREFERENCES_TOGGLE: toggleCorpusPreferences,
    USER_PREFERENCES_TOGGLE: toggleUserPreferences,

    SET_ARTICLE_PREFERENCES: setArticlePreferences,
    SET_CORPUS_PREFERENCES: setCorpusPreferences,
    SET_EXPORT_PREFERENCES: setExportPreferences,
    SET_USER_PREFERENCES: setUserPreferences,

    UPDATE_SELECTED_TAG: updateSelectedTag,
  })
}

function persistStateIntoLocalStorage({ getState }) {
  const actionStateMap = new Map([
    ['ARTICLE_PREFERENCES_TOGGLE', 'articlePreferences'],
    ['SET_ARTICLE_PREFERENCES', 'articlePreferences'],
    ['SET_EXPORT_PREFERENCES', 'exportPreferences'],
    ['USER_PREFERENCES_TOGGLE', 'userPreferences'],
    ['SET_USER_PREFERENCES', 'userPreferences'],
  ])

  return (next) => {
    return (action) => {
      if (actionStateMap.has(action.type)) {
        const key = actionStateMap.get(action.type)
        // we run the reducer first
        next(action)
        // we fetch the updated state
        const state = getState()[key]

        // we persist it for a later page reload
        localStorage.setItem(key, JSON.stringify(state))

        return
      } else if (action.type === 'LOGOUT') {
        localStorage.removeItem('articlePreferences')
        localStorage.removeItem('userPreferences')
      }

      if (action.type === 'LOGIN' || action.type === 'UPDATE_SESSION_TOKEN') {
        next(action)
        const { sessionToken } = getState()
        localStorage.setItem(sessionTokenName, sessionToken)
        return
      }

      if (action.type === 'LOGOUT') {
        localStorage.removeItem(sessionTokenName)
        return next(action)
      }

      return next(action)
    }
  }
}

function setProfile(state, action) {
  const { user } = action

  if (!user) {
    return { ...state, activeUser: structuredClone(initialState.activeUser) }
  }

  return {
    ...state,
    activeUser: {
      ...state.activeUser,
      ...user,
    },
  }
}

function setSessionToken(state, { token: sessionToken }) {
  return {
    ...state,
    sessionToken,
  }
}

function loginUser(state, { user, token: sessionToken }) {
  if (sessionToken) {
    return {
      ...state,
      sessionToken,
      activeUser: {
        ...state.activeUser,
        ...user,
        // dates are expected to be in timestamp string format (including milliseconds)
        createdAt: String(new Date(user.createdAt).getTime()),
        updatedAt: String(new Date(user.updatedAt).getTime()),
      },
    }
  }

  return state
}

function updateActiveUserDetails(state, action) {
  return {
    ...state,
    activeUser: { ...state.activeUser, ...action.payload },
  }
}

function logoutUser() {
  return structuredClone(initialState)
}

function togglePreferences(storeKey) {
  return function togglePreferencesReducer(state, { key, value }) {
    const preferences = state[storeKey]

    return {
      ...state,
      [storeKey]: {
        ...preferences,
        [key]: value === undefined ? !preferences[key] : value,
      },
    }
  }
}

function setPreferences(storeKey) {
  return function setPreferencesReducer(state, { key, value }) {
    const preferences = state[storeKey]

    return {
      ...state,
      [storeKey]: {
        ...preferences,
        [key]: value,
      },
    }
  }
}

const toggleArticlePreferences = togglePreferences('articlePreferences')
const setArticlePreferences = setPreferences('articlePreferences')
const toggleUserPreferences = togglePreferences('userPreferences')
const setUserPreferences = setPreferences('userPreferences')
const toggleCorpusPreferences = togglePreferences('corpusPreferences')
const setExportPreferences = setPreferences('exportPreferences')
const setCorpusPreferences = setPreferences('corpusPreferences')

function updateSelectedTag(state, { tagId }) {
  const { selectedTagIds } = state.activeUser
  return {
    ...state,
    activeUser: {
      ...state.activeUser,
      selectedTagIds: selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((selectedTagId) => selectedTagId !== tagId)
        : [...selectedTagIds, tagId],
    },
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 25,
    })
  : compose

export default function createReduxStore(state = {}) {
  return createStore(
    createRootReducer({
      ...structuredClone(initialState),
      ...structuredClone(state),
    }),
    composeEnhancers(
      applyMiddleware(persistStateIntoLocalStorage),
      createSentryReduxEnhancer()
    )
  )
}
