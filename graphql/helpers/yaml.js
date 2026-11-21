const YAML = require('js-yaml')

/**
 * Est-ce que l'objet est vide.
 * @param {unknown} object
 * @returns {boolean} vrai si l'objet est vide, sinon faux.
 */
function objectIsEmpty(object) {
  return typeof object === 'object' && Object.keys(object).length === 0
}

/**
 * Crée une copie de l'objet et supprime les valeurs vides/null/undefined.
 * @param {unknown} object
 * @returns {unknown|null} null si l'objet est vide, sinon l'objet sans les valeurs vides/null/undefined.
 */
function clean(object) {
  if (typeof object === 'string' && object === '') {
    return null
  }

  if (object === null || object === undefined) {
    return null
  }

  const objectCloned = structuredClone(object)

  if (objectIsEmpty(objectCloned)) {
    return null
  }

  for (const propName in objectCloned) {
    /* eslint-disable security/detect-object-injection */
    const value = objectCloned[propName]
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      objectIsEmpty(value)
    ) {
      delete objectCloned[propName]
    }
  }
  return objectCloned
}

/**
 * Transforme des métadonnées en bloc de métadonnées YAML (délimité par `---`).
 * Produit le même résultat que `toYaml` du front (`front/src/components/organisms/metadata/yaml.js`).
 * @param {unknown} metadata
 * @returns {string} une chaine vide si les métadonnées sont vides, sinon leur représentation YAML.
 */
function toYaml(metadata) {
  const output = clean(metadata)
  if (output === null) {
    return ''
  }
  return `---\n${YAML.dump(output, { sortKeys: true })}---`
}

/**
 * Renvoie les métadonnées dans le format demandé.
 * @param {object|null|undefined} metadata
 * @param {'json'|'yaml'} [format='json']
 * @returns {object|string|null|undefined}
 */
function formatMetadata(metadata, format = 'json') {
  return format === 'yaml' ? toYaml(metadata) : metadata
}

module.exports = {
  toYaml,
  formatMetadata,
}
