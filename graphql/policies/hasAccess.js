const User = require('../models/user')
const us = require("../../front/build/assets/Write.31d547b9");

/**
 * Returns true if the user retrieve from the request (JWT token) exists (and is either an admin or has an unique identifier).
 * Otherwise, throws an exception.
 *
 * @param {{_id?: ObjectId|string, admin?: boolean}|undefined} userFromRequest
 */
function isAuthenticated (userFromRequest) {
  if (userFromRequest === undefined || (userFromRequest._id === undefined && userFromRequest.admin !== true)) {
    throw new Error('Unauthorized: missing authentication.')
  }
}

/**
 * Check that the user retrieve from the request (JWT token) can access data of the optional `userId` parameter.
 * Returns a user id or throws an exception if it lacks valid authentication credentials or it has insufficient rights.
 *
 * @param {{_id?: ObjectId|string, admin?: boolean}|undefined} userFromRequest
 * @param {string|undefined} [userId]
 * @return {Promise<string>} - a user id
 */
async function hasAccess (userFromRequest, userId) {
  isAuthenticated(userFromRequest)
  const userIdToken = userFromRequest._id ? String(userFromRequest._id) : undefined

  if (userFromRequest.admin === true) {
    if (typeof userId !== 'undefined') {
      return userId
    }
    if (typeof userIdToken !== 'undefined') {
      return userIdToken
    }
    throw new Error('Unauthorized: missing user id.')
  }

  if (typeof userIdToken === 'undefined') {
    throw new Error('Unauthorized: missing user id.')
  }

  const fromSharedUserId = userId !== userIdToken ? userId : undefined
  if (fromSharedUserId) {
    const sharedUserIds = await User.findAccountAccessUserIds(userIdToken)
    if (!sharedUserIds.includes(fromSharedUserId)) {
      throw new Error(`Forbidden: user with id ${userIdToken} cannot access user account with id ${userId}, account is not shared.`)
    }
    return fromSharedUserId
  }

  return userIdToken
}

module.exports = {
  isAuthenticated,
  hasAccess
}
