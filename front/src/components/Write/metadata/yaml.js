import YAML from 'js-yaml'

/**
 * Crée une copie de l'objet et supprime les valeurs vides/null/undefined.
 * @param object
 * @return {unknown|null} null si l'objet est vide, sinon l'objet sans les valeurs vides/null/undefined.
 */
function clean (object) {
  const objectCloned = structuredClone(object)

  if (objectCloned === null || objectCloned === undefined) {
    return null
  }

  if (objectIsEmpty(objectCloned)) {
    return null
  }

  for (const propName in objectCloned) {
    if (
      objectCloned[propName] === null ||
      objectCloned[propName] === undefined ||
      objectCloned[propName] === ''
    ) {
      delete objectCloned[propName]
    }
    if (Array.isArray(objectCloned[propName]) && objectCloned[propName].length === 0) {
      delete objectCloned[propName]
    }
    if (objectIsEmpty(objectCloned[propName])) {
      delete objectCloned[propName]
    }
  }
  return objectCloned
}

/**
 * Est-ce que l'objet est vide.
 * @param object
 * @return {boolean} vrai si l'objet est vide, sinon faux.
 */
function objectIsEmpty (object) {
  return typeof object === 'object' && Object.keys(object).length === 0
}

/**
 * Transforme un objet en YAML.
 * @param object
 * @return {string} une chaine vide si l'objet est vide, sinon la représentation YAML de l'objet.
 */
export function toYaml (object) {
  const output = clean(object)
  if (output === null) {
    return ''
  }
  return '---\n' + YAML.dump(output, { sortKeys: true }) + '---'
}
