/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  tableName: 'Versions',
  autoPK: true,
  attributes: {
    owner:{
      model:'Users'
    },
    article:{
      model:'Articles'
    },
    version:{
      type:'integer',
      defaultsTo:1
    },
    revision:{
      type:'integer',
      defaultsTo:0
    },
    xml:{
      type:'longtext',
      defaultsTo:'<XML></XML>'
    },
    yaml:{
      type:'longtext',
      defaultsTo:'Yaml:'
    }
  }
};
