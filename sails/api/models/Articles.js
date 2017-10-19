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
    owner:{
      model:'Users',
      defaultsTo:1
    },
    title:{
      type:'string',
      size:256,
      defaultsTo:"autocreated"
    },
    version:{
      type:'integer',
      defaultsTo:1
    },
    revision:{
      type:'integer',
      defaultsTo:0
    },
    versions:{
      collection:'Versions',
      via:'article'
    }

  },

  afterCreate: function(article, next){
    let data = {owner:article.owner,article:article.id};
    Versions.create(data).exec( function (err, version) {
    });
    next();
  }


};
