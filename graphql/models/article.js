const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { yaml: defaultYaml, md: defaultMd, bib: defaultBib } = require('../data/defaultsData.js')

const articleSchema = new Schema({
  owners:[
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  title: {
    type:String,
    required:true,
    default: 'autocreated'
  },
  zoteroLink:{
    type:String,
    default: ''
  },
  workingVersion: {
    md: {
      type: String,
      default: defaultMd
    },
    yaml: {
      type: String,
      default: defaultYaml
    },
    bib: {
      type: String,
      default: defaultBib
    },
  },
  versions:[
    {
      type: Schema.Types.ObjectId,
      ref: 'Version'
    }
  ],
  tags:[
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('Article', articleSchema);
