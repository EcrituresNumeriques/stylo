/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
const defaultArticle = {
  md:"# titre",
  bib:"",
  yaml:"---\ntitle:Title\n---"
};

module.exports = {
  tableName: 'users',
  autoPK: true,
  attributes: {
    displayName: {
      type: 'string',
      required: true,
      size: 255
    },
    admin: {
      type:'boolean',
      required:true,
      defaultsTo:false
    },
    first_name: {
      type: 'string',
      required: false,
      size: 45
    },
    last_name: {
      type: 'string',
      required: false,
      size: 45
    },
    institution: {
      type: 'string',
      required: false,
      size: 45
    }
  }
};
