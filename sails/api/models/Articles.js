/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'articles',
  autoPK: true,
  attributes: {
    owners:{
      collection:'Users',
      via:'id'
    },
    title:{
      type:'string',
      size:256,
      defaultsTo:"autocreated"
    },
    version:{
      model:'Versions'
    },
    versions:{
      collection:'Versions',
      via:'article'
    }

  },

  afterCreate: function(article, next){
    //console.log("creating version for article",article);
      let data = {owner:article.owner[0],article:article.id};
      Users.findOne({id:article.owner[0]}).exec( function(error,User){
        if(error){console.log("creating new Version for new Article failed",error)}
        if(User.yaml){data.yaml = User.yaml}
        Versions.create(data).exec( function (err, version) {
            //console.log("created Version At article creation");
            next();
        });
      })
    }



};
