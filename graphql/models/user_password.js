const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userPasswordSchema = new Schema({
  users:[{
    type:Schema.Types.ObjectId,
    ref: 'User'
  }],
  password:{
    type: String,
    required:true
  },
  username:{
    type: String,
    unique:true,
    required:true,
  },
  email:{
    type:String,
    unique:true,
    required:true
  },
  unlock:{
    type: Date,
    default: new Date()
  },
  active:{
    type: Boolean,
    default: true
  },
  expiresAt:{
    type: Date
  },
}, {timestamps: true});

module.exports = mongoose.model('Password', userPasswordSchema);
