/**
 * Credentials.js
 *
 * @description :: List of all way of connecting to the API
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
 const bcrypt = require('bcrypt');
 const SALT_WORK_FACTOR = 10;
 const beforeSave = function(values,next){
   if(values.password){
     if(/\$2a\$10\$/.test(values.password)){
       //password already a hash
       next();
     }
     else{
       //need to hash the password
       values.password = bcrypt.hashSync(values.password,SALT_WORK_FACTOR);
       next();
     }
   }
 }



module.exports = {
  autoPK:true,
  attributes: {
    owner: {
      model:'Users'
    },
    username: {
      type: 'string',
      unique: true,
      size: 255
    },
    email: {
      type: 'email',
      unique: true,
      size: 255
    },
    enabled: {
      type: 'boolean',
      required: true,
      defaultsTo: true
    },
    token: {
      type: 'string',
      required: false,
      size: 255
    },
    salt: {
      type: 'string',
      required: false,
      size: 255
    },
    password: {
      type: 'string',
      required: false,
      size: 255
    },
    last_login: {
      type: 'datetime',
      required: false
    },
    locked: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    expired: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },
    expires_at: {
      type: 'datetime',
      required: false
    },
    confirmation_token: {
      type: 'string',
      size: 255
    }
  },
  beforeCreate: beforeSave,
  beforeUpdate: beforeSave,

};
