/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  listNames: function(req,res){
    Users.find().exec(function (err, users){
      if (err) { return res.serverError(err);}
      users.forEach(
        function(u){
          delete u.admin;
          delete u.roles;
          delete u.first_name;
          delete u.last_name;
          delete u.country;
          delete u.createdAt;
          delete u.updatedAt;
          delete u.defaultEdition;
        }
      );
      return res.json(users);
    });
  },
  updateInfos: function(req,res){

    let id = req.params.parentid || req.params.id ;
    Users.update({id_user:id},req.body).exec(function afterwards(err, updated){
      if (err) { return res.error({message:'error update'});}
      req.session.user = updated[0];
      return res.json(updated[0]);
    });
  }
};
