import { applyMiddleware, compose, createStore } from 'redux'
import { toEntries } from './helpers/bibtex'
import ArticleService from './services/ArticleService'
import WorkspaceService from './services/WorkspaceService.js'
const { SNOWPACK_SESSION_STORAGE_ID: sessionTokenName = 'sessionToken' } = import.meta.env

function createReducer (initialState, handlers) {
  return function reducer (state = initialState, action) {
    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

function toWebsocketEndpoint (endpoint) {
  if (endpoint) {
    const endpointUrl = new URL(endpoint)
    const protocol = endpointUrl.protocol
    return `${protocol === 'https:' ? 'wss' : 'ws'}://${endpointUrl.hostname}:${endpointUrl.port}/ws`
  }
  return `ws://127.0.0.1:3030/ws`
}

// Définition du store Redux et de l'ensemble des actions
export const initialState = {
  hasBooted: false,
  sessionToken: localStorage.getItem(sessionTokenName),
  workingArticle: {
    state: 'saved',
    bibliography: {
      text: '',
      entries: []
    }
  },
  // they are defined statically via vite.config.js
  applicationConfig: {
    backendEndpoint: __BACKEND_ENDPOINT__,
    graphqlEndpoint: __GRAPHQL_ENDPOINT__,
    exportEndpoint: __EXPORT_ENDPOINT__,
    processEndpoint: __PROCESS_ENDPOINT__,
    pandocExportEndpoint: __PANDOC_EXPORT_ENDPOINT__,
    humanIdRegisterEndpoint: __HUMANID_REGISTER_ENDPOINT__,
  },
  articleStructure: [],
  articleVersions: [],
  createArticleVersionError: null,
  articleWriters: [],
  articlePreferences: localStorage.getItem('articlePreferences') ? JSON.parse(localStorage.getItem('articlePreferences')) : {
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
    activeWorkspaceId: null
  },
  latestTagCreated: null,
  latestCorpusCreated: null,
  latestCorpusDeleted: null,
  userPreferences: localStorage.getItem('userPreferences') ? JSON.parse(localStorage.getItem('userPreferences')) : {
    // The user we impersonate
    currentUser: null,
    trackingConsent: true /* default value should be false */
  },
  editorCursorPosition: {
    lineNumber: 0,
    column: 0
  }
}

function createRootReducer (state) {
  return createReducer(state, {
    APPLICATION_CONFIG: setApplicationConfig,
    PROFILE: setProfile,
    CLEAR_ZOTERO_TOKEN: clearZoteroToken,
    LOGIN: loginUser,
    UPDATE_SESSION_TOKEN: setSessionToken,
    UPDATE_ACTIVE_USER_DETAILS: updateActiveUserDetails,
    LOGOUT: logoutUser,

    // article reducers
    UPDATE_ARTICLE_STATS: updateArticleStats,
    UPDATE_ARTICLE_STRUCTURE: updateArticleStructure,
    UPDATE_ARTICLE_WRITERS: updateArticleWriters,

    // user preferences reducers
    USER_PREFERENCES_TOGGLE: toggleUserPreferences,

    SET_ARTICLE_VERSIONS: setArticleVersions,
    SET_WORKING_ARTICLE_UPDATED_AT: setWorkingArticleUpdatedAt,
    SET_WORKING_ARTICLE_TEXT: setWorkingArticleText,
    SET_WORKING_ARTICLE_METADATA: setWorkingArticleMetadata,
    SET_WORKING_ARTICLE_BIBLIOGRAPHY: setWorkingArticleBibliography,
    SET_WORKING_ARTICLE_STATE: setWorkingArticleState,
    SET_CREATE_ARTICLE_VERSION_ERROR: setCreateArticleVersionError,

    ARTICLE_PREFERENCES_TOGGLE: toggleArticlePreferences,

    UPDATE_EDITOR_CURSOR_POSITION: updateEditorCursorPosition,

    SET_WORKSPACES: setWorkspaces,
    SET_ACTIVE_WORKSPACE: setActiveWorkspace,

    UPDATE_SELECTED_TAG: updateSelectedTag,
    TAG_CREATED: tagCreated,

    SET_LATEST_CORPUS_DELETED: setLatestCorpusDeleted,
    SET_LATEST_CORPUS_CREATED: setLatestCorpusCreated,
    SET_LATEST_CORPUS_UPDATED: setLatestCorpusUpdated,
  })
}

const createNewArticleVersion = store => {
  return next => {
    return async (action) => {
      if (action.type === 'CREATE_WORKSPACE') {
        const { activeUser, sessionToken, applicationConfig } = store.getState()
        const workspaces = activeUser.workspaces
        const workspaceService = new WorkspaceService(sessionToken, applicationConfig)
        const response = await workspaceService.create(action.data)
        store.dispatch({ type: 'SET_WORKSPACES', workspaces: [response.createWorkspace, ...workspaces] })
        return next(action)
      }
      if (action.type === 'LEAVE_WORKSPACE') {
        const { activeUser, sessionToken, applicationConfig } = store.getState()
        const workspaces = activeUser.workspaces
        const workspaceService = new WorkspaceService(sessionToken, applicationConfig)
        const workspaceId = action.data.workspaceId
        await workspaceService.leave(workspaceId)
        store.dispatch({ type: 'SET_WORKSPACES', workspaces: workspaces.filter((w) => w._id !== workspaceId) })
        return next(action)
      }
      if (action.type === 'CREATE_NEW_ARTICLE_VERSION') {
        const { activeUser, sessionToken, applicationConfig, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, major, message } = action
        const articleService = new ArticleService(userId, articleId, sessionToken, applicationConfig)
        try {
          const response = await articleService.createNewVersion(major, message)
          store.dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: response.article.createVersion.versions })
        } catch (err) {
          store.dispatch({ type: 'SET_CREATE_ARTICLE_VERSION_ERROR', err: err })
        }
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_TEXT') {
        const { activeUser, sessionToken, applicationConfig, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, text } = action
        try {
          const { article } = await new ArticleService(userId, articleId, sessionToken, applicationConfig).saveText(text)
          store.dispatch({ type: 'SET_WORKING_ARTICLE_STATE', workingArticleState: 'saved' })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_TEXT', text })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_UPDATED_AT', updatedAt: article.updateWorkingVersion.updatedAt })
        } catch (err) {
          console.error(err)
          store.dispatch({
            type: 'SET_WORKING_ARTICLE_STATE',
            workingArticleState: 'saveFailure',
            message: err.message
          })
        }
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_METADATA') {
        const { activeUser, sessionToken, applicationConfig, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, metadata } = action
        try {
          const { article } = await new ArticleService(userId, articleId, sessionToken, applicationConfig).saveMetadata(metadata)
          store.dispatch({ type: 'SET_WORKING_ARTICLE_STATE', workingArticleState: 'saved' })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_METADATA', metadata })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_UPDATED_AT', updatedAt: article.updateWorkingVersion.updatedAt })
        } catch (err) {
          console.error(err)
          store.dispatch({ type: 'SET_WORKING_ARTICLE_STATE', workingArticleState: 'saveFailure' })
        }
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_BIBLIOGRAPHY') {
        const { activeUser, sessionToken, applicationConfig, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, bibliography } = action
        try {
          const { article } = await new ArticleService(userId, articleId, sessionToken, applicationConfig).saveBibliography(bibliography)
          store.dispatch({ type: 'SET_WORKING_ARTICLE_STATE', workingArticleState: 'saved' })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_BIBLIOGRAPHY', bibliography })
          store.dispatch({ type: 'SET_WORKING_ARTICLE_UPDATED_AT', updatedAt: article.updateWorkingVersion.updatedAt })
        } catch (err) {
          console.error(err)
          store.dispatch({ type: 'SET_WORKING_ARTICLE_STATE', workingArticleState: 'saveFailure' })
        }
        return next(action)
      }
      return next(action)
    }
  }
}

function persistStateIntoLocalStorage ({ getState }) {
  return (next) => {
    return (action) => {
      if (action.type === 'ARTICLE_PREFERENCES_TOGGLE') {
        // we run the reducer first
        next(action)
        // we fetch the updated state
        const { articlePreferences } = getState()
        // we persist it for a later page reload
        localStorage.setItem('articlePreferences', JSON.stringify(articlePreferences))

        return
      } else if (action.type === 'USER_PREFERENCES_TOGGLE') {
        // we run the reducer first
        next(action)
        // we fetch the updated state
        const { userPreferences } = getState()
        // we persist it for a later page reload
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences))

        return
      } else if (action.type === 'LOGOUT') {
        const { applicationConfig } = getState()
        localStorage.removeItem('articlePreferences')
        localStorage.removeItem('userPreferences')
        document.location.replace(applicationConfig.backendEndpoint + '/logout')
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

function setApplicationConfig (state, action) {
  const applicationConfig = {
    ...action.applicationConfig,
    websocketEndpoint: toWebsocketEndpoint(action.applicationConfig.backendEndpoint)
  }

  return { ...state, applicationConfig }
}

function setProfile (state, action) {
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
      ...user
    }
  }
}

function clearZoteroToken (state) {
  return {
    ...state,
    activeUser: {
      ...state.activeUser,
      zoteroToken: null
    }
  }
}

function setSessionToken (state, { token: sessionToken }) {
  return {
    ...state,
    sessionToken
  }
}

function loginUser (state, { user, token: sessionToken }) {
  if (sessionToken) {
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

function updateActiveUserDetails (state, action) {
  return {
    ...state,
    activeUser: { ...state.activeUser, ...action.payload },
  }
}

function logoutUser (state) {
  return { ...state, ...initialState }
}


const SPACE_RE = /\s+/gi
const CITATION_RE = /(\[@[\w-]+)/gi
const REMOVE_MARKDOWN_RE = /[#_*]+\s?/gi

function updateArticleStats (state, { md }) {
  const text = (md || '').trim()

  const textWithoutMarkdown = text.replace(REMOVE_MARKDOWN_RE, '')
  const wordCount = textWithoutMarkdown
    .replace(SPACE_RE, ' ')
    .split(' ').length

  const charCountNoSpace = textWithoutMarkdown.replace(SPACE_RE, '').length
  const charCountPlusSpace = textWithoutMarkdown.length
  const citationNb = text.match(CITATION_RE)?.length || 0

  return {
    ...state, articleStats: {
      wordCount,
      charCountNoSpace,
      charCountPlusSpace,
      citationNb
    }
  }
}

function updateArticleStructure (state, { md }) {
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

function updateArticleWriters (state, { articleWriters }) {
  return { ...state, articleWriters }
}

function setArticleVersions (state, { versions }) {
  return { ...state, articleVersions: versions }
}

function setCreateArticleVersionError (state, { err }) {
  return  { ...state, createArticleVersionError: err }
}

function setWorkingArticleUpdatedAt (state, { updatedAt }) {
  const { workingArticle } = state
  return { ...state, workingArticle: { ...workingArticle, updatedAt } }
}

function setWorkingArticleText (state, { text }) {
  const { workingArticle } = state
  return { ...state, workingArticle: { ...workingArticle, text } }
}

function setWorkingArticleMetadata (state, { metadata }) {
  const { workingArticle } = state
  return { ...state, workingArticle: { ...workingArticle, metadata } }
}

function setWorkingArticleBibliography (state, { bibliography }) {
  const bibTeXEntries = toEntries(bibliography)
  const { workingArticle } = state
  return {
    ...state,
    workingArticle: { ...workingArticle, bibliography: { text: bibliography, entries: bibTeXEntries } }
  }
}

function setWorkingArticleState (state, { workingArticleState, message }) {
  const { workingArticle } = state
  return { ...state, workingArticle: { ...workingArticle, state: workingArticleState, stateMessage: message } }
}

function toggleArticlePreferences (state, { key, value }) {
  const { articlePreferences } = state

  return {
    ...state,
    articlePreferences: {
      ...articlePreferences,
      [key]: value === undefined ? !articlePreferences[key] : value,
    }
  }
}

function toggleUserPreferences (state, { key, value }) {
  const { userPreferences } = state

  return {
    ...state,
    userPreferences: {
      ...userPreferences,
      [key]: value === undefined ? !userPreferences[key] : value,
    }
  }
}

function updateEditorCursorPosition (state, { lineNumber, column }) {
  return {
    ...state,
    editorCursorPosition: {
      lineNumber,
      column
    }
  }
}

function setWorkspaces (state, { workspaces }) {
  return {
    ...state,
    activeUser: {
      ...state.activeUser,
      workspaces
    }
  }
}

function setActiveWorkspace (state, { workspaceId }) {
  return {
    ...state,
    activeUser: {
      ...state.activeUser,
      activeWorkspaceId: workspaceId
    }
  }
}

function updateSelectedTag (state, { tagId }) {
  const { selectedTagIds } = state.activeUser
  return {
    ...state,
    activeUser: {
      ...state.activeUser,
      selectedTagIds: selectedTagIds.includes(tagId)
        ? selectedTagIds.filter(selectedTagId => selectedTagId !== tagId)
        : [...selectedTagIds, tagId]
    }
  }
}

function tagCreated (state, { tag }) {
  return {
    ...state,
    latestTagCreated: tag
  }
}

function setLatestCorpusDeleted(state, { data }) {
  return {
    ...state,
    latestCorpusDeleted: data
  }
}

function setLatestCorpusCreated(state, { data }) {
  return {
    ...state,
    latestCorpusCreated: data
  }
}

function setLatestCorpusUpdated (state, { data }) {
  return {
    ...state,
    latestCorpusUpdated: data
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function createReduxStore (state = initialState) {
  return createStore(createRootReducer(state), composeEnhancers(
    applyMiddleware(createNewArticleVersion, persistStateIntoLocalStorage)
  ))
}
