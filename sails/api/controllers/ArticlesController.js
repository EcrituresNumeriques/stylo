/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  findMine: function(req,res){
    //console.log("Logging in");
      Articles.find({owner:req.session.user.id}).populate("versions",{limit: 1, sort: 'createdAt DESC'}).exec(function(err,thisUsersArticle){
        //console.log("userfound",thisUsersArticle);
        res.ok(thisUsersArticle);
        });
  },
  findLastVersions: function(req,res){
      Articles.findOne({id:req.params.id}).populate("versions",{limit: 30, sort: 'createdAt DESC'}).exec(function(err,thisArticle){
      //console.log("userfound",thisUsersArticle);
      res.ok(thisArticle);
      });
  },
  share: function(req,res){
    //console.log("searching",req.body,req.query,req.params);
      Articles.findOne({id:req.params.id}).exec(function(err,thisArticle){
          //console.log("article found",thisArticle);
          Users.findOne({email:req.body.add}).exec(function (err, record) {
              //console.log("found",record);
            thisArticle.owner.push(record.id);
            thisArticle.save();
            res.ok(thisArticle);
          });
        });
  },
};
