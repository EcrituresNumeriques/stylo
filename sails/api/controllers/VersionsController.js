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
              res.json(newArticle);
            });
          });
        });
      });
  },
  autosave: function(req,res){
    Versions.destroy({article:req.body.article,version:req.body.version,revision:req.body.revision,owner:req.session.user.id,autosave:true})
    .then(function(version){
      const newVersion = {...req.body,owner:req.session.user.id,title:req.session.user.displayName+' (a)'}
      Versions.create(newVersion).then(function(newVersion){
        res.json(newVersion);
      });
      return true;
    });
  },
  newVersion: function(req,res){
    Versions.destroy({article:req.body.article,version:req.body.version,revision:req.body.revision,owner:req.session.user.id,autosave:true})
    .then(function(version){
      const computedVersion = req.body.major?req.body.version+1:req.body.version;
      const computedRevision = req.body.major?0:req.body.revision+1;
      const newVersion = {...req.body,version:computedVersion,revision:computedRevision,owner:req.session.user.id}
      console.log(computedVersion,computedRevision,newVersion);
      Versions.create(newVersion).then(function(newVersion){
        res.json(newVersion);
      });
      return true;
    });
    },
    Updaty: function(req,res){
        res.json({ok:true});
        return true;
    }
};
