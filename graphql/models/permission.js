const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  scope: {
    type: String,
    enum: ['user', 'article']
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
});

module.exports = mongoose.model('Permission', permissionSchema)
module.exports.schema = permissionSchema
