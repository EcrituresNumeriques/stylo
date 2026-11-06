const mongoose = require('mongoose')
const User = require('../models/user')
const Tag = require('../models/tag')
const Article = require('../models/article')

const isUser = require('../policies/isUser')

const { BadRequestError, NotFoundError } = require('../helpers/errors')
const { requireArgument } = require('../helpers/arguments.js')

/**
 * Tag fields given inline (deprecated) rather than in the input argument.
 * @param {object} args
 * @returns {object|undefined}
 */
function deprecatedTagInput(args) {
  const fields = ['name', 'description', 'color'].filter((field) =>
    Object.hasOwn(args, field)
  )
  if (fields.length === 0) {
    return undefined
  }
  return Object.fromEntries(fields.map((field) => [field, args[field]]))
}

module.exports = {
  Mutation: {
    async createTag(_, args, context) {
      const { userId } = isUser(args, context)
      const thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('This user does not exist')
      }
      const input = requireArgument(
        'input',
        args.input,
        deprecatedTagInput(args)
      )
      if (!input.name || !input.color) {
        throw new BadRequestError(
          'INVALID_INPUT',
          'The name and the color of a tag are required.'
        )
      }
      return await Tag.create({
        name: input.name,
        description: input.description,
        color: input.color,
        owner: thisUser,
      })
    },

    async deleteTag(_, args, context) {
      const { userId } = isUser(args, context)
      const tag = await Tag.findOne({ _id: args.tagId, owner: userId })
      if (!tag) {
        throw new Error('Unable to find tag')
      }
      await tag.deleteOne()
      return tag
    },

    async updateTag(_, args, context) {
      const { userId } = isUser(args, context)
      const tagId = requireArgument('tagId', args.tagId, args.tag)
      const input = args.input ?? deprecatedTagInput(args) ?? {}
      const thisTag = await Tag.findOne({ _id: tagId, owner: userId })
      if (!thisTag) {
        throw new Error('Unable to find tag')
      }
      ;['name', 'description', 'color'].forEach((field) => {
        if (Object.hasOwn(input, field)) {
          /* eslint-disable security/detect-object-injection */
          thisTag.set(field, input[field])
        }
      })
      return thisTag.save()
    },
  },

  Query: {
    async tag(_, args, context) {
      const { userId } = isUser(args, context)
      const tagId = requireArgument('tagId', args.tagId, args.tag)
      const query = context.token.admin
        ? { _id: tagId }
        : { _id: tagId, owner: userId }

      const tag = await Tag.findOne(query)
      if (!tag) {
        throw new NotFoundError('Tag', tagId)
      }
      return tag
    },

    async tags(_root, args, context) {
      const { userId } = isUser(args, context)
      return Tag.find({ owner: userId })
    },
  },

  Tag: {
    async creator(tag, _args, context) {
      if (!tag.owner) {
        return null
      }
      if (tag instanceof mongoose.Document && tag.populated('owner')) {
        return tag.owner
      }
      return context.loaders.users.load(tag.owner._id ?? tag.owner)
    },

    async articles(tag) {
      return Article.find({ tags: tag._id }, null, null).populate('versions')
    },
  },
}
