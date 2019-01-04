const mongoose = require('mongoose');
const defaultsData = require('../data/defaultsData')
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
  md:{
    type:String,
    default:'# titre'
  },
  sommaire:{
    type:String,
    default:'# titre'
  },
  yaml:{
    type:String,
    default:defaultsData.yaml
  },
  bib:{
    type:String,
    default:''
  },
}, {timestamps:true});

module.exports = mongoose.model('Version', versionSchema);
