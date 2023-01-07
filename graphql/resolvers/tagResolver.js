const User = require('../models/user')
const Tag = require('../models/tag')

const isUser = require('../policies/isUser')

const { ApiError } = require('../helpers/errors')

module.exports = {
  Mutation: {
    async createTag (_, args, context){
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

      //fetch user
      const thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('This user does not exist')
      }

      //Add default article + default version
      const newTag = Tag.create({
        name: args.name,
        description: args.description,
        color: args.color,
      })

      thisUser.tags.push(newTag)
      newTag.owner = thisUser

      await thisUser.save()

      return newTag
    },
    async deleteTag (_, args, context) {
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

      //Recover tag, and all articles
      const tag = await Tag.findOne({ _id: args.tag, owner: userId })
      if (!tag) {
        throw new Error('Unable to find tag')
      }

      //pull tags from user and article + remove tag
      await tag.remove()

      return tag.$isDeleted()
    },
    async updateTag (_, args, context) {
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

      const thisTag = await Tag.findOne({ _id: args.tag, owner: userId })
      if (!thisTag) {
        throw new Error('Unable to find tag')
      }

      if (args.name) {
        thisTag.name = args.name
      }
      if (args.description) {
        thisTag.description = args.description
      }
      if (args.color) {
        thisTag.color = args.color
      }

      return thisTag.save()
    },
  },

  Query: {
    async tag (_, args, context) {
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

      const tag = Tag.findOne({ _id: args.tag, owner: userId }).populate({
        path: 'articles',
        populate: { path: 'versions' },
      })

      if (!tag) {
        throw new ApiError('NOT_FOUND', `Unable to find tag with id ${args.tag}`)
      }

      return tag
    },

    async tags (_, args, context) {
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

      return Tag.find({ owner: userId }).populate({
        path: 'articles',
        populate: { path: 'versions' },
      })
    },
  },

  Tag: {
    async articles (tag, { limit }) {
      await tag.populate({ path: 'articles', options: { limit } }).execPopulate()

      return tag.articles
    },

    // @TODO when `owner: ID!` changes into `owner: User!`
    // async owner (tag) {
    //   await tag.populate({ path: 'owner', populate: { path: 'user' }}).execPopulate()

    //   return tag.owner
    // }
  },
}
