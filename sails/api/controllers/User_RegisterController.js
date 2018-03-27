/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  newUser: function(req,res){
    let request = Object.assign({},req.query,req.body);
    let result = res;
    if(!request.password){
      result.json(400, {message:'you need to specify a password'});
    }
    else if(!request.username){
      result.json(400, {message:'you need to specify a username'});
    }
    else if(!request.email){
      result.json(400, {message:'you need to specify an email'});
    }
    else{
        //check if there's already an user with this email
        Users.findOne({email:request.email}).then(function(thisUser){
            console.log("email served this user",thisUser);
            //User found, throw error
            if(thisUser){
                result.json(400, {message:"this email is already linked to an account"});
            }
            //Proceed with creation
            else{
                User_Credentials.create(request).exec(function(err,thisCredential){
                  if(err){
                      result.json(400, {message:JSON.stringify(err)});
                  }
                  else{
                    //Credentials are validated
                    let contextCredential = thisCredential;
                    request.displayName = request.displayName || request.username;
                    delete request.password;
                    Users.create(request).exec(function(err,thisUser){
                      if(err){result.json(400, {message:err})}
                      else{
                        //User is created
                        contextCredential.owner = thisUser.id;
                        contextCredential.save();
                        result.ok(thisUser);
                      }
                    })
                  }
                });
            }
        });
    }
  }
};
