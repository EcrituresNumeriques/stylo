const mongoose = require('mongoose');

module.exports.UserPermissionSchema = new mongoose.Schema({
  scope: {
    type: String,
    enum: ['user'],
    default: 'user'
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  roles: [ String ]
})

module.exports.ArticlePermissionSchema = new mongoose.Schema({
  scope: {
    type: String,
    enum: ['article'],
    default: 'article'
  },

  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
})
