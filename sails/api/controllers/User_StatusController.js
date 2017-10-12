/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
const bcrypt = require('bcrypt');

module.exports = {
  status: function(req,res){
    //console.log(req.session.user);
    if(req.session.user){
      res.ok(req.session.user);
    }
    else{
      res.badRequest({humanReadable:'not loggedIn'})
    }
  }
};
