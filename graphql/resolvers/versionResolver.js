const Version = require('../models/version');

const isUser = require('../policies/isUser')

module.exports = {
  saveVersion: async (args,req) => {

    //filter bad requests
    try{
      isUser(args,req)

    }
    catch(err){
      throw err
    }

  }
}
