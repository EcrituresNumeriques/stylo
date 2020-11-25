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
  message:{
    type:String,
    default:''
  },
  md:{
    type:String,
    default: ''
  },
  sommaire:{
    type:String,
    default: ''
  },
  yaml:{
    type:String,
    default: ''
  },
  bib:{
    type:String,
    default:''
  },
  hidden:{
    type:Boolean,
    default:false
  }
}, {timestamps:true});

module.exports = mongoose.model('Version', versionSchema);
