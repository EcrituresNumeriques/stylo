const storageKey = 'sessionToken'

/**
 * Le jeton de session est conservé dans le localStorage. Il est lu au moment
 * d'envoyer une requête, depuis un composant comme depuis un `loader`.
 *
 * @returns {string|null}
 */
export function getSessionToken() {
  return localStorage.getItem(storageKey)
}

/**
 * @param {string} token
 */
export function setSessionToken(token) {
  localStorage.setItem(storageKey, token)
}

export function removeSessionToken() {
  localStorage.removeItem(storageKey)
}
