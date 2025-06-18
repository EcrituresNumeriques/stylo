const User = require('../models/user')
const Tag = require('../models/tag')

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
      const newTag = await Tag.create({
        name: args.name,
        description: args.description,
        color: args.color,
        owner: thisUser,
      })
      // TODO do not add tag in user.tags
      thisUser.tags.push(newTag)
      await thisUser.save()
      return newTag
    },
    async deleteTag(_, args, context) {
      const { userId } = isUser(args, context)
      const tag = await Tag.findOne({ _id: args.tag, owner: userId })
      if (!tag) {
        throw new Error('Unable to find tag')
      }
      await tag.remove()
      return tag.$isDeleted()
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

      // TODO load articles using a query on the articles collection
      const tag = Tag.findOne(query).populate({
        path: 'articles',
        populate: { path: 'versions' },
      })

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
    async articles(tag, { limit }) {
      // TODO load articles using a query on the articles collection
      await tag
        .populate({ path: 'articles', options: { limit } })
        .execPopulate()
      return tag.articles
    },
  },
}
