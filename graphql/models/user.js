const mongoose = require('mongoose');
const defaultsData = require('../data/defaultsData')

const Article = require('./article');
const { UserPermissionSchema } = require('./permission');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  tags: [
    {
      type:Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  acquintances: [
    {
      type:Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  articles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }
  ],
  authType: {
    type: String,
    default: 'local',
    enum: ['local', 'oidc']
  },
  password: {
    type: String,
    default: null
  },
  permissions: [ UserPermissionSchema ],
  displayName: {
    type: String,
  },
  admin: {
    type:Boolean,
    default: false
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  institution: {
    type: String
  },
  zoteroToken: {
    type: String
  },
  yaml: {
    type: String,
    defaults: defaultsData.yaml
  }
}, {timestamps: true});

module.exports = mongoose.model('User', userSchema)
module.exports.schema = userSchema

module.exports.postCreate = function postCreate (newUser) {
  console.log('%s has been saved', newUser._id);

  // Create a new default article for each new user
  const defaultArticle = defaultsData.article
  const newArticle = new Article({title: defaultArticle.title});

  newUser.articles.push(newArticle)
  newArticle.owners.push(newUser)

  return Promise.all([
    newUser.save(),
    newArticle.save(),
  ])
}
