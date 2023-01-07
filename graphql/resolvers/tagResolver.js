const User = require('../models/user')
const Tag = require('../models/tag')
const Article = require('../models/article')

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
      const newTag = new Tag({
        name: args.name,
        description: args.description,
        color: args.color,
      })

      thisUser.tags.push(newTag)
      newTag.owner = thisUser

      const createdTag = await newTag.save()
      await thisUser.save()

      return createdTag
    },
    async deleteTag (_, args, context) {
      const allowedIds = await User.findAccountAccessUserIds(context.token._id)
      const { userId } = isUser(args, context, allowedIds)

      //Recover tag, and all articles
      const thisTag = await Tag.findOne({ _id: args.tag, owner: userId })
      if (!thisTag) {
        throw new Error('Unable to find tag')
      }

      //fetch user
      const thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('This user does not exist')
      }

      //pull tags from user and article + remove tag
      thisUser.tags.pull(args.tag)
      await Article.updateMany(
        { tags: args.tag },
        { $pull: { tags: args.tag } }
      )
      await Tag.findOneAndRemove({ _id: args.tag })
      const returnUser = await thisUser.save()

      return returnUser
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
