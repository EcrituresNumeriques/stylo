const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const versionSchema = new Schema({
  owner:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  article:{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  },
  autosave:{
    type:Boolean,
    default:true
  },
  title:{
    type:String,
    default:''
  },
  version:{
    type:Number,
    default:0
  },
  revision:{
    type:Number,
    default:0
  },
  message:{
    type:String,
    default:''
  },
  md: String,
  yaml: String,
  bib: String,
  sommaire:{
    type:String,
    default:'# titre'
  },
  hidden:{
    type:Boolean,
    default:false
  }
}, {timestamps:true});

module.exports = mongoose.model('Version', versionSchema);
module.exports.schema = versionSchema
