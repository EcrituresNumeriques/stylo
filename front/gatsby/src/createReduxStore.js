import { applyMiddleware, createStore, compose } from 'redux'
import { toEntries } from './helpers/bibtex'
import VersionService from './services/VersionService'
import ArticleService from "./services/ArticleService"
import MetadataService from "./services/MetadataService"

function createReducer (initialState, handlers) {
  return function reducer (state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

// Définition du store Redux et de l'ensemble des actions
const initialState = {
  logedIn: false,
  users: [],
  password: undefined,
  sessionToken: undefined,
  workingArticle: {
  },
  articleStructure: [],
  articleVersions: [],
  articleStats: {
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  },
}

const reducer = createReducer(initialState, {
  APPLICATION_CONFIG: setApplicationConfig,
  PROFILE: setProfile,
  CLEAR_ZOTERO_TOKEN: clearZoteroToken,
  LOGIN: loginUser,
  UPDATE_ACTIVE_USER: updateActiveUser,
  RELOAD_USERS: reloadUsers,
  SWITCH: switchUser,
  LOGOUT: logoutUser,
  REMOVE_MYSELF_ALLOWED_LOGIN: removeMyselfAllowedLogin,

  // article reducers
  UPDATE_ARTICLE_STATS: updateArticleStats,
  UPDATE_ARTICLE_STRUCTURE: updateArticleStructure,
  UPDATE_ARTICLE_BIB: updateArticleBib,

  SET_ARTICLE_VERSIONS: setArticleVersions,
  SET_WORKING_ARTICLE_UPDATED_AT: setWorkingArticleUpdatedAt,
  SET_WORKING_ARTICLE_TEXT: setWorkingArticleText,
  SET_WORKING_ARTICLE_METADATA: setWorkingArticleMetadata,
})

const createNewArticleVersion  = store => {
  return next => {
    return async (action) => {
      if (action.type === 'CREATE_NEW_ARTICLE_VERSION') {
        const { articleVersions, activeUser, applicationConfig } = store.getState()
        const userId = activeUser._id
        const { articleId, major, message } = action
        const versionService = new VersionService(userId, articleId, applicationConfig)
        const response = await versionService.createNewArticleVersion(major, message)
        store.dispatch({ type: 'SET_ARTICLE_VERSIONS', versions: [response.saveVersion, ...articleVersions] })
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_TEXT') {
        const { activeUser, applicationConfig } = store.getState()
        const userId = activeUser._id
        const { articleId, text } = action
        const { updateWorkingVersion } = await new ArticleService(userId, articleId, applicationConfig).saveText(text)
        store.dispatch({ type: 'SET_WORKING_ARTICLE_TEXT', text })
        store.dispatch({ type: 'SET_WORKING_ARTICLE_UPDATED_AT', updatedAt: updateWorkingVersion.updatedAt })
        return next(action)
      }
      if (action.type === 'UPDATE_WORKING_ARTICLE_METADATA') {
        const { activeUser, applicationConfig } = store.getState()
        const userId = activeUser._id
        const { articleId, metadata } = action
        const { updateWorkingVersion } =new MetadataService(userId, articleId, applicationConfig).saveMetadata(metadata)
        store.dispatch({ type: 'SET_WORKING_ARTICLE_METADATA', metadata })
        store.dispatch({ type: 'SET_WORKING_ARTICLE_UPDATED_AT', updatedAt: updateWorkingVersion.updatedAt })
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
    // it will allow password modification if logged with password,
    // otherwise it means we use an external auth service
    password:
      activeUser.passwords.find((p) => p.email === activeUser.email) || {},
    users: [activeUser._id],
  })
}

function clearZoteroToken (state) {
  state.activeUser.zoteroToken = null

  return state
}

function loginUser (state, { login }) {
  if (login.password && login.users && login.token) {
    return {
      ...state,
      logedIn: true,
      users: login.users,
      activeUser: login.users[0],
      password: login.password,
      sessionToken: login.token,
    }
  }

  return state
}

function updateActiveUser (state, action) {
  return {
    ...state,
    activeUser: { ...state.activeUser, displayName: action.payload },
    users: [...state.users].map((u) => {
      if (state.activeUser._id === u._id) {
        u.displayName = action.payload
      }
      return u
    })

  }
}

function reloadUsers (state, { payload: users }) {
  return { ...state, users }
}

function switchUser (state, { payload: activeUser }) {
  if (state.users.map((u) => u._id).includes(activeUser._id)) {
    return { ...state, activeUser }
  }

  return state
}

function logoutUser (state) {
  return { ...state, ...initialState }
}

function removeMyselfAllowedLogin (state, { payload: userId }) {
  const remainingUsers = state.users.filter((u) => u._id !== userId)

  return {
    ...state,
    users: remainingUsers,
    activeUser: remainingUsers[0],
  }
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
    .filter((lineWithIndex) => lineWithIndex.line.match(/^##+\ /))
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

function updateArticleBib(state, { bib }) {
  const articleBibTeXEntries = toEntries(bib)
  return { ...state, articleBib: bib, articleBibTeXEntries }
}

function setArticleVersions(state, { versions }) {
  return { ...state, articleVersions: versions }
}

function setWorkingArticleUpdatedAt(state, { updatedAt }) {
  const { workingArticle } = state
  console.log('setWorkingArticleUpdatedAt')
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

const enhancers = compose(
  applyMiddleware(createNewArticleVersion),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default () => createStore(reducer, undefined, enhancers)
