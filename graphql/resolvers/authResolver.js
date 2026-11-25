const User = require('../models/user')
const isUser = require('../policies/isUser')
const { requireArgument } = require('../helpers/arguments.js')
const { BadRequestError } = require('../helpers/errors.js')
const { createFailureLimiter } = require('../auth/rateLimit.js')

const config = require('../config.js')

// failed checks of the current password, per user (same settings as the login, per account and IP address)
const passwordFailures = createFailureLimiter({
  enabled: config.get('security.loginRateLimit.enabled'),
  windowMs: config.get('security.loginRateLimit.windowMinutes') * 60 * 1000,
  limit: config.get('security.loginRateLimit.maxFailuresPerIdentifierAndIp'),
})

/**
 * Finds the account matching a login identifier (username, email or legacy display name).
 *
 * @param {string} username
 * @returns {Promise<import('mongoose').HydratedDocument<import('../models/user.js')> | null>}
 */
function findUserByIdentifier(username) {
  return User.findOne({
    $or: [
      {
        // backward compatibility
        $and: [{ username: { $exists: false } }, { displayName: username }],
      },
      { username },
      { email: username },
    ],
  })
}

/**
 * @param {object} credentials
 * @param {string} credentials.username
 * @param {string} credentials.password
 * @param {object | null} [credentials.account] account matching the username, when it has already been looked up
 */
async function checkCredentials({ username, password, account }) {
  if (!username || username.trim().length === 0) {
    throw new Error('Username must not be empty!')
  }
  const user =
    account === undefined ? await findUserByIdentifier(username) : account

  if (!user?.password || !(await user.comparePassword(password))) {
    const error = new Error(
      'Unable to authenticate, please check your username and password!'
    )
    error.status = 403
    throw error
  }

  return user
}

module.exports = {
  checkCredentials,
  findUserByIdentifier,
  passwordFailures,
  Mutation: {
    async changePassword(_, args, context) {
      const { userId } = isUser(args, context)
      const currentPassword = requireArgument(
        'input',
        args.input?.currentPassword,
        args.old
      )
      const newPassword = requireArgument(
        'input',
        args.input?.newPassword,
        args.new
      )

      // find User
      const user = await User.findOne({ _id: userId })
      if (!user) {
        throw new Error('Could not find user')
      }

      // An account created with an external service has no password yet,
      // so the first password can be set without the current one.
      // TODO: require a recent authentication once sessions carry an `auth_time`.
      if (user.password) {
        // the attempt is counted before the (slow) check, so concurrent attempts are counted too
        if (!passwordFailures.consume(userId)) {
          throw new BadRequestError(
            'TOO_MANY_ATTEMPTS',
            'Too many failed attempts, please try again later.'
          )
        }
        if (!(await user.comparePassword(currentPassword))) {
          throw new Error('Old password is incorrect')
        }
        passwordFailures.reset(userId)
      }

      // set new password
      user.set('password', newPassword)
      await user.save()

      return user
    },
  },
}
