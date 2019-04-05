const mongoose = require('mongoose');
const defaultsData = require('../data/defaultsData')
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique:true,
    required: true
  },
  tags:[
    {
      type:Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  acquintances:[
    {
      type:Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  articles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }
  ],
  tokens: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Token'
    }
  ],
  passwords:[
    {
      type: Schema.Types.ObjectId,
      ref: 'Password'
    }
  ],
  displayName: {
    type: String,
    required: true,
    unique: true
  },
  admin: {
    type:Boolean,
    default:false
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  institution: {
    type: String
  },
  yaml:{
    type:String,
    defaults:defaultsData.yaml
  }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema);
