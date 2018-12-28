const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator()
var SHA256 = require("crypto-js/sha256");

const userTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  token:{
    type: String,
    default: SHA256(uidgen.generateSync()),
    required:true,
    unique:true
  },
  name:{
    type: String,
    default: "default token key"
  },
  active:{
    type: Boolean,
    default: true
  },
  expiresAt:{
    type: Date
  },

}, {timestamps: true});

module.exports = mongoose.model('Token', userTokenSchema);
