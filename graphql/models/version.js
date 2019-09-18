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
    default:`## section title
<-- Add your text here, and the document title in the metadatas tool -->
1. Use only title of level 2 (##) for sections and more (level 1 is used for the article title)
2. The text is automatically saved. You can version it with [Save as] button
3. Check the documentation in the menu`
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
  hidden:{
    type:Boolean,
    default:false
  }
}, {timestamps:true});

module.exports = mongoose.model('Version', versionSchema);
