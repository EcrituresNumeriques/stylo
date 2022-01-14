const mongoose = require('mongoose');
const defaultsData = require('../data/defaultsData')

const Article = require('./article');
const { UserPermissionSchema } = require('./permission')
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
  permissions: [
    UserPermissionSchema
  ],
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


userSchema.statics.findAllArticles = async function (userId) {
  const user = await this
    .findById(userId)
    .populate('tags acquintances')
    // see https://mongoosejs.com/docs/api/document.html#document_Document-populate
    // for subdocument population
    .populate({
      path: 'articles',
      populate: [
        {
          path: 'owner versions tags',
        },
        {
          path: 'contributors',
          populate: 'user'
        }
      ],
    })
    .lean();

  if (!user) {
    return null
  }

  // Also, fetch its granted accounts, and documents
  const users = await this.findAccountAccessArticles(user)

  if (users.length) {
    const extraArticles = users
      .flatMap(({ articles }) => articles)
      .filter(({ id }) => !user.articles.find(a => a._id == id))

    user.articles.push(...extraArticles)
  }

  user.articles.sort((a, b) => b.updatedAt - a.updatedAt)

  return user
}

userSchema.statics.findAccountAccessUserIds = async function (userId, role = 'write') {
  const users = await this
    .find({ permissions: { $elemMatch: { user: userId, scope: 'user', roles: { $in: role } } } })
    .lean()

  return users.map(({ _id }) => _id).concat(userId)
}

userSchema.statics.findAccountAccessArticles = function (user, role = 'read') {
  return this
    .find({ permissions: { $elemMatch: { user, scope: 'user', roles: { $in: role } } } })
    .populate({
      path: 'articles',
      populate: [
        {
          path: 'owner versions tags',
        },
        {
          path: 'contributors',
          populate: 'user'
        }
      ],
    })
}

module.exports = mongoose.model('User', userSchema)
module.exports.schema = userSchema

module.exports.postCreate = function postCreate (newUser) {
  console.log('%s has been saved', newUser._id);

  // Create a new default article for each new user
  const defaultArticle = defaultsData.article
  const newArticle = new Article({title: defaultArticle.title});

  newUser.articles.push(newArticle)
  newArticle.owner = newUser

  return Promise.all([
    newUser.save(),
    newArticle.save(),
  ])
}
