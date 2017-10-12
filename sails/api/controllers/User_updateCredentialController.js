/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
const bcrypt = require('bcrypt');

module.exports = {
  updatePassword: function(req,res){
    //console.log("Logging in");
      let password = req.body.old || req.query.old || '';
      let npassword = req.body.new || req.query.new || '';
      User_Credentials.findOne({id_user:req.session.user.id_user}).then(function(thisUser){
          if(bcrypt.compareSync(password,_.get(thisUser,'password','nops'))){
                //console.log(response);
                thisUser.password = npassword;
                thisUser.save(function(){
                  res.ok({'humanReadable':'Password changed'});
                });
              }
            else{
              res.badRequest({'humanReadable':'old password invalid'});
            }
        });
  }
};
