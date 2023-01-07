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
  owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
  },
  color: {
    type: String,
    get: color => color || '#ccc'
  },
  articles:[
    {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }
  ]
}, {timestamps: true});

tagSchema.post('remove', async function () {
  await this.model('User').updateOne(
    { _id: this.owner },
    { $pull: { tags: this.id }}
  )

  await this.model('Article').updateMany(
    { tags: this.id },
    { $pull: { tags: this.id } }
  )
})

module.exports = mongoose.model('Tag', tagSchema);
module.exports.schema = tagSchema;
