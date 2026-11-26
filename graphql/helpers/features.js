const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')

const config = require('../config.js')
const { NotAuthenticatedError, NotAuthorizedError } = require('./errors.js')

/**
 * @typedef {{ state: 'off' | 'on' | 'opt-in', users?: string[], groups?: string[] }} Flag
 * @typedef {{ groups?: Record<string, string[]>, flags?: Record<string, Flag> }} Features
 * @typedef {{ username?: string | null } | null | undefined} FeatureUser
 */

const states = ['off', 'on', 'opt-in']
const isList = (value) =>
  value === undefined ||
  (Array.isArray(value) && value.every((v) => typeof v === 'string'))

/** @type {Features} everything is off until loadFeatures() */
let current = {}

/**
 * @param {Features} features
 * @returns {string | undefined} the first error
 */
function validateFeatures({ groups = {}, flags = {} }) {
  for (const [name, users] of Object.entries(groups)) {
    if (!/^[a-z0-9_/-]+$/.test(name)) return `invalid group name "${name}"`
    if (!isList(users)) return `groups.${name} must be a list of usernames`
  }
  for (const [name, flag] of Object.entries(flags)) {
    if (!states.includes(flag?.state)) {
      return `flags.${name}.state must be one of ${states.join(', ')}`
    }
    if (!isList(flag.users)) return `flags.${name}.users must be a list`
    if (!isList(flag.groups)) return `flags.${name}.groups must be a list`
    const undeclared = flag.groups?.find((g) => !Object.hasOwn(groups, g))
    if (undeclared) return `flags.${name}: undeclared group "${undeclared}"`
  }
}

/**
 * Reads the file copied by Ansible, everything is off without it.
 * A relative path starts from the root of the repository.
 *
 * @param {string} [file]
 * @returns {Features}
 */
function loadFeatures(file = config.get('features.file')) {
  let features = {}
  if (file) {
    try {
      const path = resolve(__dirname, '../..', file)
      features = JSON.parse(readFileSync(path, 'utf8'))
      const error = validateFeatures(features)
      if (error) throw new Error(error)
    } catch (error) {
      throw new Error(`Invalid features file ${file}: ${error.message}`)
    }
  }
  current = features
  return features
}

/**
 * @param {string} name
 * @param {FeatureUser} user
 * @param {Features} [features]
 * @returns {boolean}
 */
function isFeatureEnabled(name, user, features = current) {
  const flag = features.flags?.[name]
  if (flag?.state === 'on') return true
  if (flag?.state !== 'opt-in' || !user?.username) return false
  return [
    ...(flag.users ?? []),
    ...(flag.groups ?? []).flatMap((group) => features.groups[group]),
  ].includes(user.username)
}

/**
 * @param {FeatureUser} user
 * @param {Features} [features]
 * @returns {string[]} names of the features enabled for the user
 */
function resolveFeatures(user, features = current) {
  return Object.keys(features.flags ?? {}).filter((name) =>
    isFeatureEnabled(name, user, features)
  )
}

/**
 * Express middleware, after `populateUserFromJWT`.
 *
 * @param {string} name
 * @returns {import('express').RequestHandler}
 */
function requireFeature(name) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 401, error: 'UNAUTHORIZED' })
    }
    if (!isFeatureEnabled(name, req.user)) {
      return res.status(403).json({ status: 403, error: 'FORBIDDEN' })
    }
    return next()
  }
}

/**
 * @param {string} name
 * @param {{ user?: FeatureUser }} context GraphQL context
 */
function assertFeature(name, { user }) {
  if (!user) throw new NotAuthenticatedError()
  if (!isFeatureEnabled(name, user)) throw new NotAuthorizedError()
}

module.exports = {
  assertFeature,
  isFeatureEnabled,
  loadFeatures,
  requireFeature,
  resolveFeatures,
  validateFeatures,
}
