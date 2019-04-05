const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  bib: {
    type: String,
    default:""
  },
  yaml: {
    type: String,
    default:""
  },
  owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  articles:[
    {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model('Tag', tagSchema);
