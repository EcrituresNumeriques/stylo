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

// Définition du store Redux et de l'ensemble des actions
const initialState = {
  hasBooted: false,
  sessionToken: localStorage.getItem(sessionTokenName),
  workingArticle: {
    state: 'saved',
    bibliography: {
      text: '',
      entries: []
    }
  },
  applicationConfig: {
    backendEndpoint: import.meta.env.SNOWPACK_PUBLIC_BACKEND_ENDPOINT,
    graphqlEndpoint: import.meta.env.SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT,
    exportEndpoint: import.meta.env.SNOWPACK_PUBLIC_EXPORT_ENDPOINT,
    processEndpoint: import.meta.env.SNOWPACK_PUBLIC_PROCESS_ENDPOINT,
    pandocExportEndpoint: import.meta.env.SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT,
    humanIdRegisterEndpoint: import.meta.env.SNOWPACK_PUBLIC_HUMAN_ID_REGISTER_ENDPOINT,
  },
  articleStructure: [],
  articleVersions: [],
  workspaces: [],
  articlePreferences: localStorage.getItem('articlePreferences') ? JSON.parse(localStorage.getItem('articlePreferences')) : {
    expandSidebarLeft: true,
    expandSidebarRight: false,
    metadataFormMode: 'basic',
    expandVersions: false,
  },
  articleStats: {
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  },
  // Logged in user — we use their token
  activeUser: {
    zoteroToken: null
  },
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

const reducer = createReducer(initialState, {
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

  // user preferences reducers
  USER_PREFERENCES_TOGGLE: toggleUserPreferences,

  SET_ARTICLE_VERSIONS: setArticleVersions,
  SET_WORKING_ARTICLE_UPDATED_AT: setWorkingArticleUpdatedAt,
  SET_WORKING_ARTICLE_TEXT: setWorkingArticleText,
  SET_WORKING_ARTICLE_METADATA: setWorkingArticleMetadata,
  SET_WORKING_ARTICLE_BIBLIOGRAPHY: setWorkingArticleBibliography,
  SET_WORKING_ARTICLE_STATE: setWorkingArticleState,

  ARTICLE_PREFERENCES_TOGGLE: toggleArticlePreferences,

  UPDATE_EDITOR_CURSOR_POSITION: updateEditorCursorPosition,

  SET_WORKSPACES: setWorkspaces,
  SET_ACTIVE_WORKSPACE: setActiveWorkspace,
})

const createNewArticleVersion = store => {
  return next => {
    return async (action) => {
      if (action.type === 'CREATE_WORKSPACE') {
        const { workspaces, sessionToken, applicationConfig } = store.getState()
        const workspaceService = new WorkspaceService(sessionToken, applicationConfig)
        console.log('CREATE WORKSPACE', { action })
        const response = await workspaceService.create(action.data)
        console.log('RESULT', { r: response.createWorkspace })
        store.dispatch({ type: 'SET_WORKSPACES', workspaces: [response.createWorkspace, ...workspaces] })
        return next(action)
      }
      if (action.type === 'CREATE_NEW_ARTICLE_VERSION') {
        const { articleVersions, activeUser, sessionToken, applicationConfig, userPreferences } = store.getState()
        const userId = userPreferences.currentUser ?? activeUser._id
        const { articleId, major, message } = action
        const articleService = new ArticleService(userId, articleId, sessionToken, applicationConfig)
        const response = await articleService.createNewVersion(major, message)
        store.dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: [response.saveVersion, ...articleVersions] })
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
    ...action.applicationConfig
  }

  return { ...state, applicationConfig }
}

function setProfile (state, action) {
  if (!action.user) {
    return { ...state, hasBooted: true }
  }

  const { user: activeUser } = action

  return Object.assign({}, state, {
    hasBooted: true,
    activeUser,
    logedIn: true,
  })
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

function setArticleVersions (state, { versions }) {
  return { ...state, articleVersions: versions }
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
  return { ...state, workspaces }
}

function setActiveWorkspace (state, { workspaceId }) {
  return {
    ...state, activeUser: {
      ...state.activeUser,
      activeWorkspaceId: workspaceId
    }
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default () => createStore(reducer, composeEnhancers(
  applyMiddleware(createNewArticleVersion, persistStateIntoLocalStorage)
))
