const bcrypt = require('bcryptjs')

const User = require('../models/user')
const isUser = require('../policies/isUser')
const { logger } = require('../logger')

async function verifCreds ({ username, password }) {
  if (!username || username.trim().length === 0) {
    throw new Error('Username must not be empty!')
  }
  const user = await User.findOne({
    $or: [{ displayName: username }, { email: username }],
  })

  if (!user) {
    logger.error({ module: 'authentication', username }, 'Account not found for username')
    throw new Error('Unable to authenticate, please check your username and password!')
  }

  if (!(await bcrypt.compare(password, user.password))) {
    logger.error({ module: 'authentication', username }, 'Password is incorrect for username')
    throw new Error('Unable to authenticate, please check your username and password!')
  }

  return user
}

module.exports = {
  verifCreds,
  Mutation: {
    async changePassword (_, args, context) {
      isUser(args, context)

      //find User
      const user = await User.findOne({ _id: args.user })
      if (!user) {
        throw new Error("Could not find user");
      }

      //check old password
      if(!await bcrypt.compare(args.old, user.password)){
        throw new Error("Old password is incorrect");
      }

      //Set new password
      user.password = bcrypt.hashSync(args.new, 10)
      await user.save()

      return user
    }
  }
}
