const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleContributorSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  roles: [ String ]
})

const articleSchema = new Schema({
  title: {
    type:String,
    required:true,
    default: 'autocreated'
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  contributors: [ ArticleContributorSchema ],
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


/**
 * Returns a single article for a given user
 *
 * @param {{ _id: String, user: String }}
 * @returns Article
 */
 articleSchema.statics.findOneByOwner = function findOneByOwner ({ _id, user }) {
  return this
    .findOne({ _id, $or: [ { owner: { $in: user } }, { contributors: { $elemMatch: {user: { $in: user }} } } ]})
    .populate({ path: 'contributors', populate: 'user' })
}

/**
 * Returns a single article for a given user
 *
 * @param {{ userId: String }}
 * @returns Article
 */
 articleSchema.statics.findManyByOwner = function findOneByOwner ({ userId }) {
  return this
    .find({ $or: [ { owner: { $in: userId } }, { contributors: { $elemMatch: {user: { $in: userId }} } } ]})
    .sort({ updatedAt: -1 })
    .populate([
      {
        path: 'owner versions tags',
      },
      { path: 'contributors', populate: 'user' }
    ])
}

/**
 * Returns a single article, fully populated for a given user, or a list of users with sharing permissions
 *
 * @param {String} articleId
 * @param {Array<String>} users
 * @returns Article
 */
articleSchema.statics.findAndPopulateOneByOwners = function findAndPopulateOneByOwners (articleId, users) {
  // if $in is empty, we are in a case where we have an admin token fetching the data
  const $in = users.flatMap(d => d).filter(d => d)
  const _id = articleId

  // We want to query an article with a given ID
  // AND match it with a single owner
  // OR match it with one of many contributors
  const query = Array.isArray($in) && $in.length
    ? { _id, $or: [ { owner: { $in } }, { contributors: { $elemMatch: {user: { $in }} } } ] }
    : { _id }

  return this
    .findOne(query)
    .populate('owner tags')
    .populate({ path: 'versions', populate: { path: 'owner' } })
    .populate({ path: 'contributors', populate: { path: 'user' } })
}

module.exports = mongoose.model('Article', articleSchema);
module.exports.schema = articleSchema;
