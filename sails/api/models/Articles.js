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
      model:'Users'
    },
    xml:{
      type:'text'
    },
    yaml:{
      type:'text'
    },
    title:{
      type:'string',
      size:256
    },
    version:{
      type:'integer',
      default:1
    },
    revision:{
      type:'integer',
      default:0
    }

  }
};
