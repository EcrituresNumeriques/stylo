const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { deriveToc } = require('../helpers/markdown.js')

const versionSchema = new Schema({
  owner:{
    type: Schema.Types.ObjectId,
    ref: 'User'
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
  md: {
    type: String,
    set: function (md) {
      this.sommaire = deriveToc(md)
      return md
    }
  },
  yaml: String,
  bib: String,
  sommaire:{
    type: String,
    default: ''
  },
}, {timestamps:true});

module.exports = mongoose.model('Version', versionSchema);
module.exports.schema = versionSchema
