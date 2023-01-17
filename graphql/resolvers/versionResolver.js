const Version = require('../models/version')
const Article = require('../models/article')
const User = require('../models/user')

const isUser = require('../policies/isUser')

const { ApiError } = require('../helpers/errors')

module.exports = {
  Mutation: {
    async saveVersion (_, args, context) {
      const { userId } = isUser(args, context)

      // fetch user
      const thisUser = await User.findById(userId)
      if (!thisUser) {
        throw new Error('This user does not exist!')
      }

      // fetch article
      const article = await Article.findAndPopulateOneByOwners(
        args.version.article,
        context.user
      )

      if (!article) {
        throw new Error('Wrong article ID!')
      }

      return article.createNewVersion({
        mode: args.version.major ? 'MAJOR' : 'MINOR',
        message: args.version.message,
        user: thisUser
      })
    },
  },

  Query: {
    async version (_, { version: versionId }) {
      // TODO need to make sure user should have access to this version
      const version = await Version.findById(versionId).populate('owner')
      if (!version) {
        throw new ApiError(
          'NOT_FOUND',
          `Unable to find version with id ${versionId}`
        )
      }
      return version
    },
  },
  Version: {},
}
