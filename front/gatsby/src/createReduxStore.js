import { applyMiddleware, createStore } from 'redux'
import { toEntries } from './helpers/bibtex'

function createReducer (initialState, handlers) {
  return function reducer (state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

const convertBibTeXToEntries = store => {
  return next => {
    return async (action) => {
      if (action.type === 'UPDATE_ARTICLE_BIB') {
        const articleBibTeXEntries = await toEntries(action.bib)
        store.dispatch({ type: 'SET_ARTICLE_BIB_ENTRIES', articleBibTeXEntries })
        return next(action)
      } else {
        return next(action)
      }
    }
  }
}

// Définition du store Redux et de l'ensemble des actions
const initialState = {
  logedIn: false,
  users: [],
  password: undefined,
  sessionToken: undefined,
  articleStructure: [],
  articleStats: {
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  },
  articleBib: '',
  articleBibTeXEntries: [],
  articleBibValidationStatus: '',
  articleBibValidationResult: {}
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
  UPDATE_ARTICLE_BIB_ENTRIES: updateArticleBibEntries,
  SET_ARTICLE_BIB_ENTRIES: setArticleBibEntries,
  VALIDATE_ARTICLE_BIB: validateArticleBib,
  SET_ARTICLE_BIB_VALIDATION_RESULT: setArticleBibValidationResult,
  SET_ARTICLE_BIB_VALIDATION_STATUS: setArticleBibValidationStatus
})


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

function updateArticleBib (state, { bib }) {
  return { ...state, articleBib: bib }
}

function updateArticleBibEntries (state, { articleBibTeXEntries }) {
  return { ...state, articleBib: toBibtex(articleBibTeXEntries), articleBibTeXEntries }
}

function setArticleBibEntries (state, { articleBibTeXEntries }) {
  return { ...state, articleBibTeXEntries }
}

function setArticleBibValidationResult (state, { articleBibValidationResult }) {
  return { ...state, articleBibValidationResult, articleBibValidationStatus: 'completed' }
}

function setArticleBibValidationStatus (state, { articleBibValidationStatus }) {
  if (articleBibValidationStatus === 'pending') {
    return { ...state, articleBibValidationStatus, articleBibValidationResult: {} }
  }
  return { ...state, articleBibValidationStatus }
}

function validateArticleBib (state, { bib }) {
  return { ...state, articleBibValidationStatus: 'pending' }
}

export default () => createStore(
  reducer,
  applyMiddleware(convertBibTeXToEntries),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
