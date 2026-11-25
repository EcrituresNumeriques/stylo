import { createReduxEnhancer as createSentryReduxEnhancer } from '@sentry/react'

import { applyMiddleware, compose, createStore } from 'redux'

const sessionTokenName = 'sessionToken'

// État d'une session anonyme : ne doit dépendre d'aucune donnée persistée
const defaultState = {
  sessionToken: null,
  activeUser: {
    selectedTagIds: [],
  },
}

// Définition du store Redux et de l'ensemble des actions
export const initialState = {
  ...defaultState,
  sessionToken: localStorage.getItem(sessionTokenName),
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
    LOGIN: setSessionToken,
    UPDATE_SESSION_TOKEN: setSessionToken,
    LOGOUT: logoutUser,

    UPDATE_SELECTED_TAG: updateSelectedTag,
  })
}

function persistStateIntoLocalStorage({ getState }) {
  return (next) => {
    return (action) => {
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

function setSessionToken(state, { token: sessionToken }) {
  return {
    ...state,
    sessionToken,
  }
}

/**
 * L'état initial a été lu depuis le localStorage au chargement de la page :
 * il peut contenir le jeton de l'utilisateur qui se déconnecte, on repart
 * donc de l'état par défaut.
 */
function logoutUser() {
  return structuredClone(defaultState)
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
      createSentryReduxEnhancer({ stateTransformer: sentryStateTransformer })
    )
  )
}

/**
 * Only send non-personal state to Sentry: the session token must not leave
 * the browser.
 */
function sentryStateTransformer(state) {
  return {
    isLoggedIn: Boolean(state.sessionToken),
  }
}
