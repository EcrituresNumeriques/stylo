import * as Sentry from '@sentry/react'
import { applyMiddleware, compose, createStore } from 'redux'
import { applicationConfig } from './config.js'
import { toEntries } from './helpers/bibtex'
import ArticleService from './services/ArticleService'

const sentryReduxEnhancer = Sentry.createReduxEnhancer()

const sessionTokenName = 'sessionToken'

function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

// Définition du store Redux et de l'ensemble des actions
export const initialState = {
  hasBooted: false,
  sessionToken: localStorage.getItem(sessionTokenName),
  workingArticle: {
    state: 'saved',
    bibliography: {
      text: '',
      entries: [],
    },
  },
  articleWorkingCopy: {
    status: 'synced',
  },
  articleStructure: [],
  articleVersions: [],
  createArticleVersionError: null,
  articleWriters: [],
  articlePreferences: localStorage.getItem('articlePreferences')
    ? JSON.parse(localStorage.getItem('articlePreferences'))
    : {
        expandSidebarLeft: true,
        expandSidebarRight: false,
        metadataFormMode: 'basic',
        expandVersions: false,
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
    authType: null,
    authTypes: [],
    zoteroToken: null,
    selectedTagIds: [],
    workspaces: [],
    activeWorkspaceId: null,
  },
  userPreferences: localStorage.getItem('userPreferences')
    ? JSON.parse(localStorage.getItem('userPreferences'))
    : {
        // The user we impersonate
        currentUser: null,
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

function createRootReducer(state) {
  return createReducer(state, {
    PROFILE: setProfile,
    SET_AUTH_TOKEN: setAuthToken,
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

    SET_ARTICLE_VERSIONS: setArticleVersions,
    SET_WORKING_ARTICLE_UPDATED_AT: setWorkingArticleUpdatedAt,
    SET_WORKING_ARTICLE_TEXT: setWorkingArticleText,
    SET_WORKING_ARTICLE_METADATA: setWorkingArticleMetadata,
    SET_WORKING_ARTICLE_BIBLIOGRAPHY: setWorkingArticleBibliography,
    SET_WORKING_ARTICLE_STATE: setWorkingArticleState,
    SET_CREATE_ARTICLE_VERSION_ERROR: setCreateArticleVersionError,

    ARTICLE_PREFERENCES_TOGGLE: toggleArticlePreferences,

    UPDATE_EDITOR_CURSOR_POSITION: updateEditorCursorPosition,

    SET_ACTIVE_WORKSPACE: setActiveWorkspace,

    UPDATE_SELECTED_TAG: updateSelectedTag,
  })
}

const createNewArticleVersion = (store) => {
  return (next) => {
    return async (action) => {
      if (action.type === 'CREATE_NEW_ARTICLE_VERSION') {
        const { activeUser, sessionToken, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, major, message } = action
        const articleService = new ArticleService(
          userId,
          articleId,
          sessionToken
        )
        try {
          const response = await articleService.createNewVersion(major, message)
          store.dispatch({
            type: 'SET_ARTICLE_VERSIONS',
            versions: response.article.createVersion.versions,
          })
        } catch (err) {
          store.dispatch({ type: 'SET_CREATE_ARTICLE_VERSION_ERROR', err: err })
        }
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_TEXT') {
        const { activeUser, sessionToken, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, text } = action
        try {
          const { article } = await new ArticleService(
            userId,
            articleId,
            sessionToken
          ).saveText(text)
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_STATE',
            workingArticleState: 'saved',
          })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_TEXT', text })
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_UPDATED_AT',
            updatedAt: article.updateWorkingVersion.updatedAt,
          })
        } catch (err) {
          console.error(err)
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_STATE',
            workingArticleState: 'saveFailure',
            message: err.message,
          })
        }
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_METADATA') {
        const { activeUser, sessionToken, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, metadata } = action
        try {
          const { article } = await new ArticleService(
            userId,
            articleId,
            sessionToken
          ).saveMetadata(metadata)
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_STATE',
            workingArticleState: 'saved',
          })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_METADATA', metadata })
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_UPDATED_AT',
            updatedAt: article.updateWorkingVersion.updatedAt,
          })
        } catch (err) {
          console.error(err)
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_STATE',
            workingArticleState: 'saveFailure',
          })
        }
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_BIBLIOGRAPHY') {
        const { activeUser, sessionToken, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, bibliography } = action
        try {
          const { article } = await new ArticleService(
            userId,
            articleId,
            sessionToken
          ).saveBibliography(bibliography)
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_STATE',
            workingArticleState: 'saved',
          })
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_BIBLIOGRAPHY',
            bibliography,
          })
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_UPDATED_AT',
            updatedAt: article.updateWorkingVersion.updatedAt,
          })
        } catch (err) {
          console.error(err)
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_STATE',
            workingArticleState: 'saveFailure',
          })
        }
        return next(action)
      }
      return next(action)
    }
  }
}

function persistStateIntoLocalStorage({ getState }) {
  const actionStateMap = new Map([
    ['ARTICLE_PREFERENCES_TOGGLE', 'articlePreferences'],
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
        const { backendEndpoint } = applicationConfig
        localStorage.removeItem('articlePreferences')
        localStorage.removeItem('userPreferences')
        document.location.replace(backendEndpoint + '/logout')
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
    return { ...state, activeUser: undefined, hasBooted: true }
  }
  return {
    ...state,
    hasBooted: true,
    loggedIn: true,
    activeUser: {
      ...state.activeUser,
      activeWorkspaceId: action.activeWorkspaceId,
      ...user,
    },
  }
}

function setAuthToken(state, { service, token = null }) {
  if (service === 'zotero') {
    return {
      ...state,
      activeUser: {
        ...state.activeUser,
        zoteroToken: token,
      },
    }
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
    Sentry.setUser({ id: user._id })
    return {
      ...state,
      sessionToken,
      activeUser: {
        ...state.user,
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

function logoutUser(state) {
  Sentry.setUser(null)
  return { ...state, ...initialState }
}

const SPACE_RE = /\s+/gi
const CITATION_RE = /(\[@[\w-]+)/gi
const REMOVE_MARKDOWN_RE = /[#_*]+\s?/gi

function updateArticleStats(state, { md }) {
  const text = (md || '').trim()

  const textWithoutMarkdown = text.replace(REMOVE_MARKDOWN_RE, '')
  const wordCount = textWithoutMarkdown.replace(SPACE_RE, ' ').split(' ').length

  const charCountNoSpace = textWithoutMarkdown.replace(SPACE_RE, '').length
  const charCountPlusSpace = textWithoutMarkdown.length
  const citationNb = text.match(CITATION_RE)?.length || 0

  return {
    ...state,
    articleStats: {
      wordCount,
      charCountNoSpace,
      charCountPlusSpace,
      citationNb,
    },
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

function setArticleVersions(state, { versions }) {
  return { ...state, articleVersions: versions }
}

function setCreateArticleVersionError(state, { err }) {
  return { ...state, createArticleVersionError: err }
}

function setWorkingArticleUpdatedAt(state, { updatedAt }) {
  const { workingArticle } = state
  return { ...state, workingArticle: { ...workingArticle, updatedAt } }
}

function setWorkingArticleText(state, { text }) {
  const { workingArticle } = state
  return { ...state, workingArticle: { ...workingArticle, text } }
}

function setWorkingArticleMetadata(state, { metadata }) {
  const { workingArticle } = state
  return { ...state, workingArticle: { ...workingArticle, metadata } }
}

function setWorkingArticleBibliography(state, { bibliography }) {
  const bibTeXEntries = toEntries(bibliography)
  const { workingArticle } = state
  return {
    ...state,
    workingArticle: {
      ...workingArticle,
      bibliography: { text: bibliography, entries: bibTeXEntries },
    },
  }
}

function setWorkingArticleState(state, { workingArticleState, message }) {
  const { workingArticle } = state
  return {
    ...state,
    workingArticle: {
      ...workingArticle,
      state: workingArticleState,
      stateMessage: message,
    },
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

function setActiveWorkspace(state, { workspaceId }) {
  return {
    ...state,
    activeUser: {
      ...state.activeUser,
      activeWorkspaceId: workspaceId,
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

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function createReduxStore(state = initialState) {
  return createStore(
    createRootReducer(state),
    composeEnhancers(
      applyMiddleware(createNewArticleVersion, persistStateIntoLocalStorage),
      sentryReduxEnhancer
    )
  )
}
