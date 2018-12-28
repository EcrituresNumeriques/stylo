const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Password = require('../models/user_password');
const Token = require('../models/user_token');
const prepRecord = require('../helpers/prepRecord');

module.exports = {
  createUser: async args => {
    const userInput = {...args.user}

    //Check for User And credentials
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error('User with this email exists already.');
    }

    return {_id: "blablabla",displayName:"Arthur"}
  },
  users: async args => {
    console.log("in users",args)
    return [{_id: "blablabla",displayName:"Arthur"}]
  }
}
