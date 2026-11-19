/**
 * @file Logic of the `features` command (bin/features.mjs),
 * which enables or disables opt-in features for a user.
 */
const mongoose = require('mongoose')

const User = require('../models/user.js')
const {
  getFeatureStates,
  isKnownFeature,
  resolveFeatures,
} = require('./features.js')

const USAGE = `Usage:
  features list
  features show <email|id>
  features enable <feature> <email|id>
  features disable <feature> <email|id>
  features users <feature>`

/**
 * An ObjectId is looked up by `_id`, anything else by `email`.
 *
 * @param {string} identifier
 * @returns {{ _id: string } | { email: string }}
 */
function getUserQuery(identifier) {
  return mongoose.isObjectIdOrHexString(identifier)
    ? { _id: identifier }
    : { email: identifier }
}

function assertKnownFeature(name) {
  if (!isKnownFeature(name)) {
    const known = getFeatureStates()
      .map(({ name }) => name)
      .join(', ')
    throw new RangeError(`Unknown feature "${name}". Known features: ${known}.`)
  }
}

function toSummary(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    requested: [...user.features],
    resolved: resolveFeatures(user),
  }
}

async function findUser(identifier, update) {
  const query = getUserQuery(identifier)
  const user = update
    ? await User.findOneAndUpdate(query, update, { returnDocument: 'after' })
    : await User.findOne(query)

  if (!user) {
    throw new Error(`No user found with "${identifier}".`)
  }

  return user
}

function listFeatures() {
  return getFeatureStates()
}

async function showUser(identifier) {
  return toSummary(await findUser(identifier))
}

async function enableFeature(name, identifier) {
  assertKnownFeature(name)
  return toSummary(
    await findUser(identifier, { $addToSet: { features: name } })
  )
}

async function disableFeature(name, identifier) {
  assertKnownFeature(name)
  return toSummary(await findUser(identifier, { $pull: { features: name } }))
}

async function listUsers(name) {
  assertKnownFeature(name)
  const users = await User.find(
    { features: name },
    { email: true, displayName: true }
  ).lean()
  return users.map(({ _id, email, displayName }) => ({
    id: _id.toString(),
    email,
    displayName,
  }))
}

/**
 * @param {string[]} positionals command and its arguments
 * @returns {Promise<unknown>} what to print
 */
async function run([command, ...args]) {
  const usage = () => new RangeError(USAGE)

  switch (command) {
    case 'list':
      return listFeatures()
    case 'show':
      if (!args[0]) throw usage()
      return showUser(args[0])
    case 'enable':
      if (!args[0] || !args[1]) throw usage()
      return enableFeature(args[0], args[1])
    case 'disable':
      if (!args[0] || !args[1]) throw usage()
      return disableFeature(args[0], args[1])
    case 'users':
      if (!args[0]) throw usage()
      return listUsers(args[0])
    default:
      throw usage()
  }
}

module.exports = {
  disableFeature,
  enableFeature,
  getUserQuery,
  listFeatures,
  listUsers,
  run,
  showUser,
}
