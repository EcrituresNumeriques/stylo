const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  token:{
    type: String,
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
module.exports.schema = userTokenSchema;
