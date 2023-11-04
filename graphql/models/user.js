const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const { article: defaultArticle, yaml: defaultUserYaml } = require('../data/defaultsData')

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String,
    // unique but not required, we need to create a sparse index manually
  },
  // TODO remove this link
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  acquintances: [
    {
      type: Schema.Types.ObjectId,
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
    default: null,
    set: (password) => {
      return bcrypt.hashSync(password, 10)
    }
  },
  displayName: {
    type: String,
  },
  admin: {
    type: Boolean,
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
    defaults: defaultUserYaml
  }
}, { timestamps: true });

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.createDefaultArticle = async function createDefaultArticle () {
  const newArticle = await this.model('Article').create({
    title: defaultArticle.title,
    zoteroLink: defaultArticle.zoteroLink,
    owner: this,
    workingVersion: {
      yaml: defaultArticle.yaml,
      bib: defaultArticle.bib,
      md: defaultArticle.md
    },
  })

  await newArticle.createNewVersion({ mode: 'MINOR', user: this })

  this.articles.push(newArticle)
  return this.save()
}

module.exports = mongoose.model('User', userSchema)
module.exports.schema = userSchema
