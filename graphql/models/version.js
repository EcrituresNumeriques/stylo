const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { deriveToc } = require('../helpers/markdown.js')

const versionSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      default: '',
    },
    version: {
      type: Number,
      default: 0,
    },
    revision: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      default: '',
    },
    md: {
      type: String,
      set: function (md) {
        this.sommaire = deriveToc(md)
        return md
      },
    },
    // for backward compatibility, read-only
    // data are now stored in JSON format in the "metadata" field
    yaml: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
      get: (metadata) => metadata ?? {},
    },
    bib: String,
    sommaire: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, minimize: false }
)

module.exports = mongoose.model('Version', versionSchema)
