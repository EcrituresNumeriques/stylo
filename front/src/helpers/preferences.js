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

/**
 * @typedef {object} EditorPreferences
 * @property {number} zoomLevel niveau de zoom de la police de Monaco
 */

/**
 * @typedef {'article' | 'corpus' | 'editor' | 'export' | 'user'} PreferencesNamespace
 */

const defaultPreferences = {
  article: {
    expandSidebarRight: true,
    activePanel: null,
    metadataFormMode: 'basic',
  },
  corpus: {},
  /** @type {EditorPreferences} */
  editor: {
    zoomLevel: 0,
  },
  /** @type {ExportPreferences} */
  export: {
    bibliography_style: 'chicagomodified',
    with_toc: 0,
    link_citations: 0,
    with_nocite: 0,
    formats: 'html',
    unnumbered: 0,
    book_division: 'part',
  },
  /** @type {UserPreferences} */
  user: {
    trackingConsent: true /* default value should be false */,
    workspaceId: null,
  },
}

const listeners = new Set()
let preferences = readPreferences()

function storageKey(namespace) {
  return `${namespace}Preferences`
}

function readPreferences() {
  return Object.fromEntries(
    Object.entries(defaultPreferences).map(([namespace, defaults]) => {
      const value = localStorage.getItem(storageKey(namespace))
      return [namespace, { ...defaults, ...(value ? JSON.parse(value) : {}) }]
    })
  )
}

/**
 * @param {() => void} listener called whenever a preference changes
 * @returns {() => void} unsubscribe
 */
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * @param {PreferencesNamespace} namespace
 * @returns {Record<string, string|boolean|number|null>}
 */
export function getPreferences(namespace) {
  return preferences[namespace]
}

/**
 * @param {PreferencesNamespace} namespace
 * @param {string} key
 * @param {string|boolean|number|null} value
 */
export function setPreference(namespace, key, value) {
  preferences = {
    ...preferences,
    [namespace]: { ...preferences[namespace], [key]: value },
  }
  localStorage.setItem(
    storageKey(namespace),
    JSON.stringify(preferences[namespace])
  )
  listeners.forEach((listener) => listener())
}

/**
 * Oublie les préférences liées au compte (dont l'espace de travail actif).
 * Les préférences d'éditeur et d'export ne sont pas liées au compte et sont
 * conservées.
 */
export function forgetAccountPreferences() {
  for (const namespace of ['article', 'corpus', 'user']) {
    localStorage.removeItem(storageKey(namespace))
  }
  preferences = readPreferences()
  listeners.forEach((listener) => listener())
}
