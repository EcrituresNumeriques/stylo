/**
 * UsersController.js
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  fork: function(req,res){
    //console.log("Logging in");
      let idToFork = req.param('id');
      Versions.findOne({id:idToFork}).then(function(version){
        Articles.findOne({id:version.article}).then(function(article){
          Articles.create({owner:article.owner,title:article.title+"*"}).exec(function (err, newArticle) {
            Versions.create({owner:version.owner,article:newArticle.id,revision:0,version:1,xml:version.xml,yaml:version.yaml,md:version.md,bib:version.bib}).exec(function (err, newVersion) {
              newArticle = newArticle.toJSON();
              newArticle.versions = [newVersion];
              res.ok(newArticle);
            });
          });
        });
      });
  }
};
