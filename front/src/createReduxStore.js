import { createReduxEnhancer as createSentryReduxEnhancer } from '@sentry/react'
import { applyMiddleware, compose, createStore } from 'redux'

import { computeTextStats } from './helpers/markdown.js'

const sessionTokenName = 'sessionToken'

// Définition du store Redux et de l'ensemble des actions
export const initialState = {
  sessionToken: localStorage.getItem(sessionTokenName),
  articleWorkingCopy: {
    status: 'synced',
  },
  articleStructure: [],
  articleWriters: [],
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
  articleStats: {
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  },
  // Active user (authenticated)
  activeUser: {
    authTypes: [],
    authProviders: {},
    selectedTagIds: [],
    workspaces: [],
  },
  userPreferences: localStorage.getItem('userPreferences')
    ? JSON.parse(localStorage.getItem('userPreferences'))
    : {
        trackingConsent: true /* default value should be false */,
      },
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
  editorCursorPosition: {
    lineNumber: 0,
    column: 0,
  },
}

/**
 *
 * @param {*} state
 * @param initialState
 * @param handlers
 * @returns
 */
function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

/**
 *
 * @param {*} state
 * @returns
 */
function createRootReducer(state) {
  return createReducer(state, {
    PROFILE: setProfile,
    LOGIN: loginUser,
    UPDATE_SESSION_TOKEN: setSessionToken,
    UPDATE_ACTIVE_USER_DETAILS: updateActiveUserDetails,
    LOGOUT: logoutUser,

    // article reducers
    UPDATE_ARTICLE_STATS: updateArticleStats,
    UPDATE_ARTICLE_STRUCTURE: updateArticleStructure,
    UPDATE_ARTICLE_WRITERS: updateArticleWriters,
    UPDATE_ARTICLE_WORKING_COPY_STATUS: updateArticleWorkingCopyStatus,

    // user preferences reducers
    USER_PREFERENCES_TOGGLE: toggleUserPreferences,
    SET_EXPORT_PREFERENCES: setExportPreferences,

    ARTICLE_PREFERENCES_TOGGLE: toggleArticlePreferences,
    SET_ARTICLE_PREFERENCES: setArticlePreferences,

    UPDATE_EDITOR_CURSOR_POSITION: updateEditorCursorPosition,

    UPDATE_SELECTED_TAG: updateSelectedTag,
  })
}

function persistStateIntoLocalStorage({ getState }) {
  const actionStateMap = new Map([
    ['ARTICLE_PREFERENCES_TOGGLE', 'articlePreferences'],
    ['SET_ARTICLE_PREFERENCES', 'articlePreferences'],
    ['USER_PREFERENCES_TOGGLE', 'userPreferences'],
    ['SET_EXPORT_PREFERENCES', 'exportPreferences'],
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

function updateArticleStats(state, { md }) {
  return {
    ...state,
    articleStats: computeTextStats(md),
  }
}

function updateArticleStructure(state, { md }) {
  const text = (md || '').trim()
  const articleStructure = text
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter((lineWithIndex) => lineWithIndex.line.match(/^##+ /))
    .map((lineWithIndex) => {
      const title = lineWithIndex.line
        .replace(/##/, '')
        //arrow backspace (\u21B3)
        .replace(/#\s/g, '\u21B3')
        // middle dot (\u00B7) + non-breaking space (\xa0)
        .replace(/#/g, '\u00B7\xa0')
      return { ...lineWithIndex, title }
    })

  return { ...state, articleStructure }
}

function updateArticleWriters(state, { articleWriters }) {
  return { ...state, articleWriters }
}

function updateArticleWorkingCopyStatus(state, { status }) {
  return {
    ...state,
    articleWorkingCopy: { ...state.articleWorkingCopy, status },
  }
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
const setExportPreferences = setPreferences('exportPreferences')

function updateEditorCursorPosition(state, { lineNumber, column }) {
  return {
    ...state,
    editorCursorPosition: {
      lineNumber,
      column,
    },
  }
}

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
