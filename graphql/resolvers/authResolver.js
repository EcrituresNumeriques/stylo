const User = require('../models/user')
const isUser = require('../policies/isUser')

async function checkCredentials({ username, password }) {
  if (!username || username.trim().length === 0) {
    throw new Error('Username must not be empty!')
  }
  const user = await User.findOne({
    $or: [
      {
        // backward compatibility
        $and: [{ username: { $exists: false } }, { displayName: username }],
      },
      { username },
      { email: username },
    ],
  })

  if (!user || !user.password || !(await user.comparePassword(password))) {
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
  Mutation: {
    async changePassword(_, args, context) {
      const { userId } = isUser(args, context)

      // find User
      const user = await User.findOne({ _id: userId })
      if (!user) {
        throw new Error('Could not find user')
      }

      // check old password
      if (!(await user.comparePassword(args.old))) {
        throw new Error('Old password is incorrect')
      }

      // set new password
      user.set('password', args.new)
      await user.save()

      return user
    },
  },
}
