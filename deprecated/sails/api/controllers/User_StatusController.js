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
      req.session.user.log = true;
      res.ok(req.session.user);
    }
    else{
      res.badRequest({log:false})
    }
  }
};
