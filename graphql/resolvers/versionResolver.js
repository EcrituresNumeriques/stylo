const Version = require('../models/version')
const Article = require('../models/article')
const User = require('../models/user')

const isUser = require('../policies/isUser')

const { ApiError } = require('../helpers/errors')

module.exports = {
  Mutation: {
    async saveVersion (_, args, context) {
      const { findById } = isUser(args, context)

      let version, revision

      // fetch user
      const thisUser = await User.findById(findById)
      if (!thisUser) {
        throw new Error('This user does not exist!')
      }

      // fetch article
      const userIds = await User.findAccountAccessUserIds(findById)
      const articleToSaveInto = await Article.findAndPopulateOneByOwners(
        args.version.article,
        [findById, userIds]
      )

      if (!articleToSaveInto) {
        throw new Error('Wrong article ID!')
      }

      const { bib, yaml, md } = articleToSaveInto.workingVersion
      let lastMajorVersion = 0
      let lastMinorVersion = 0
      if (articleToSaveInto.versions && articleToSaveInto.versions.length) {
        const lastVersion = articleToSaveInto.versions[0]
        lastMajorVersion = lastVersion.version
        lastMinorVersion = lastVersion.revision
      }
      if (args.version.major) {
        // major
        version = lastMajorVersion + 1
        revision = 0
      } else {
        // minor
        version = lastMajorVersion
        revision = lastMinorVersion + 1
      }
      const message = args.version.message
      const createdVersion = await Version.create({
        md,
        yaml,
        bib,
        version,
        revision,
        message,
        sommaire: md
          .split('\n')
          .filter((line) => line.match(/^#+ /))
          .join('\n'),
        owner: thisUser.id,
      }).then((v) => v.populate('owner').execPopulate())

      articleToSaveInto.versions.push(createdVersion)
      await articleToSaveInto.save()

      return createdVersion
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
