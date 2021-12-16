const Version = require('../models/version');
const Article = require('../models/article');
const User = require('../models/user');

const isUser = require('../policies/isUser')

const populateArgs = require('../helpers/populateArgs')

module.exports = {
  saveVersion: async (args, { req }) => {
    /*
          article: $articleId,
      major: $major,
      message: $message
     */
    isUser(args, req)

    let version, revision

    // fetch user
    const thisUser = await User.findOne({ _id: args.user })
    if (!thisUser) {
      throw new Error('This user does not exist!')
    }

    // fetch article
    const userIds = await User.findAccountAccessUserIds(args.user)
    const articleToSaveInto = await Article.findOneByOwners(args.version.article, [req.user._id, userIds])

    if (!articleToSaveInto) {
      throw new Error('Wrong article ID!')
    }

    const {bib, yaml, md} = articleToSaveInto.workingVersion
    let lastMajorVersion = 0
    let lastMinorVersion = 0
    if (articleToSaveInto.versions && articleToSaveInto.versions.length) {
      const lastVersion = articleToSaveInto.versions[articleToSaveInto.versions.length - 1]
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
    const newVersion = {
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
      owner: thisUser.id
    }
    const returnedVersion = await Version.create(newVersion)
    articleToSaveInto.versions.push(returnedVersion)
    await articleToSaveInto.save()

    return returnedVersion
  },
  unlinkVersion: async (args, { req }) => {
    args = populateArgs(args, req)
    isUser(args, req)
  },
  version: async (args, { req }) => {
    isUser(args, req)

    // TODO need to make sure user should have access to this version
    const version = await Version.findById(args.version).populate('owner article')

    return version
  },
}
