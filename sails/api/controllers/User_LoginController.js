/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
const bcrypt = require('bcrypt');

module.exports = {
  validateLogin: function(req,res){
    //console.log("Logging in");
      let email = req.body.email || req.query.email || '';
      let password = req.body.password || req.query.password || '';
      User_Credentials.findOne({email:email}).then(function(thisUser){
          if(bcrypt.compareSync(password,_.get(thisUser,'password','nops'))){
              Users.findOne({id_user:thisUser.id_user}).exec(function(err,response){
                req.session.user = response;
                //console.log(response);
                res.ok(response);
              })
            }
            else{
              res.badRequest({'humanReadable':'email or password invalid'});
            }
        });
  },
  logout: function(req,res){
        req.session.user = undefined;
        res.ok({message:'logged out!'});
      }
};
