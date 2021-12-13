const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const User = require('../models/user')

const populateArgs = require('../helpers/populateArgs')

const isUser = require('../policies/isUser')

const { populateUser } = require('./nestedModel')

async function verifCreds ({ username, password }) {
  if (!username || username.trim().length === 0) {
    throw new Error('Username must not be empty!')
  }
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  })

  if (!user) {
    console.error(`[authentication] Account not found for username: ${username}`)
    throw new Error('Unable to authenticate, please check your username and password!')
  }

  if (!(await bcrypt.compare(password, user.password))) {
    console.error(`[authentication] Password is incorrect for username: ${username}`)
    throw new Error('Unable to authenticate, please check your username and password!')
  }

  return user
}

module.exports = {
  verifCreds,
  changePassword: async (args, {req}) => {
    populateArgs(args,req)
    isUser(args,req)

    //find User
    const user = await User.findOne({ _id: args.user })

    //check old password
    if(!await bcrypt.compare(args.old, user.password)){
      throw new Error("Old password is incorrect");
    }

    //Set new password
    user.password = bcrypt.hashSync(args.new, 10)
    await user.save()

    return user
  },
}
