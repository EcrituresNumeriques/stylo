import yaml from 'js-yaml'

export function cleanOutput(object) {
  let cleaning = JSON.parse(JSON.stringify(object))

  if (ObjectIsEmpty(cleaning)) {
    return ''
  }

  for (const propName in cleaning) {
    if (
      cleaning[propName] === null ||
      cleaning[propName] === undefined ||
      cleaning[propName] === ''
    ) {
      delete cleaning[propName]
    }
    if (Array.isArray(cleaning[propName]) && cleaning[propName].length === 0) {
      delete cleaning[propName]
    }
    if (ObjectIsEmpty(cleaning[propName])) {
      delete cleaning[propName]
    }
  }
  return cleaning
}

export function ObjectIsEmpty(object) {
  return typeof object === 'object' && Object.keys(object).length === 0
}

export function toYaml(formData) {
  return '---\n' + yaml.dump(cleanOutput(formData), { sortKeys: true }) + '\n---'
}
