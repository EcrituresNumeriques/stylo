const YAML = require('js-yaml')
const mongoose = require('mongoose')

const Version = require('../models/version')
const { ApiError } = require('../helpers/errors')
const { reformat } = require('../helpers/metadata.js')
const { previewEntries } = require('../helpers/bibliography')
const { toLegacyFormat } = require('../helpers/metadata')

module.exports = {
  Query: {
    async version(_, { version: versionId }) {
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

  Version: {
    async owner(version, _args, context) {
      if (version instanceof mongoose.Document && version.populated('owner')) {
        return version.owner
      }
      return context.loaders.users.load(version.owner._id)
    },

    async rename(version, { name }) {
      version.set('message', name)
      const result = await version.save({ timestamps: false })

      return result === version
    },

    bibPreview({ bib }) {
      return previewEntries(bib)
    },

    yaml({ metadata = {} }, { options }) {
      const legacyMetadata = toLegacyFormat(metadata)
      const yaml = YAML.dump(legacyMetadata)
      return options?.strip_markdown
        ? reformat(yaml, { replaceBibliography: false })
        : yaml
    },
  },
}
