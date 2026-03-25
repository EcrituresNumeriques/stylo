const User = require('../models/user')
const Tag = require('../models/tag')
const Article = require('../models/article')

const isUser = require('../policies/isUser')

const { NotFoundError } = require('../helpers/errors')

module.exports = {
  Mutation: {
    async createTag(_, args, context) {
      const { userId } = isUser(args, context)
      const thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('This user does not exist')
      }
      return await Tag.create({
        name: args.name,
        description: args.description,
        color: args.color,
        owner: thisUser,
      })
    },

    async deleteTag(_, args, context) {
      const { userId } = isUser(args, context)
      const tag = await Tag.findOne({ _id: args.tag, owner: userId })
      if (!tag) {
        throw new Error('Unable to find tag')
      }
      await tag.deleteOne()
      return true
    },

    async updateTag(_, args, context) {
      const { userId } = isUser(args, context)
      const thisTag = await Tag.findOne({ _id: args.tag, owner: userId })
      if (!thisTag) {
        throw new Error('Unable to find tag')
      }
      ;['name', 'description', 'color'].forEach((field) => {
        if (Object.hasOwn(args, field)) {
          /* eslint-disable security/detect-object-injection */
          thisTag.set(field, args[field])
        }
      })
      return thisTag.save()
    },
  },

  Query: {
    async tag(_, args, context) {
      const { userId } = isUser(args, context)
      const query = context.token.admin
        ? { _id: args.tag }
        : { _id: args.tag, owner: userId }

      const tag = await Tag.findOne(query)
      if (!tag) {
        throw new NotFoundError('Tag', args.tag)
      }
      return tag
    },

    async tags(_root, args, context) {
      const { userId } = isUser(args, context)
      return Tag.find({ owner: userId })
    },
  },

  Tag: {
    async articles(tag) {
      return Article.find({ tags: tag._id }, null, null).populate('versions')
    },
  },
}
