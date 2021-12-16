const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
      default: ''
    },
    yaml: {
      type: String,
      default: ''
    },
    bib: {
      type: String,
      default: ''
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

articleSchema.statics.findOneByOwners = function findOneByOwners (articleId, users) {
  // if $in is empty, we are in a case where we have an admin token fetching the data
  const $in = users.flatMap(d => d).filter(d => d)

  return this
    .findOne($in.length ? { _id: articleId, owners: { $in } } : { _id: articleId })
    .populate('owners tags')
    .populate({ path: 'versions', populate: { path: 'owner' } })
    .lean()
}

module.exports = mongoose.model('Article', articleSchema);
module.exports.schema = articleSchema;
