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
      console.log("Entering login");
      User_Credentials.findOne({email:email}).then(function(thisUser){
        console.log(thisUser);
          if(bcrypt.compareSync(password,_.get(thisUser,'password','nops'))){
            console.log("Password good");
            /*
                Users.findOne({id:thisUser.id}).exec(function(err,response){
                  console.log(response);
                req.session.user = response;
                res.ok(response);
              })
              */
              Users.find().exec(function (err, records) {
                console.log(records);
                res.ok({loged:true});
              });
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
