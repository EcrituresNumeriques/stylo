const YAML = require('js-yaml')
const mongoose = require('mongoose')

const Version = require('../models/version')
const Article = require('../models/article')
const { NotFoundError } = require('../helpers/errors')
const { reformat } = require('../helpers/metadata.js')
const { previewEntries } = require('../helpers/bibliography')
const { toLegacyFormat } = require('../helpers/metadata')
const { toEntries } = require('../helpers/bibtex')

module.exports = {
  Mutation: {
    async renameVersion(_, { versionId, name }) {
      // TODO need to make sure user should have access to this version
      const version = await Version.findById(versionId)
      if (!version) {
        throw new NotFoundError('Version', versionId)
      }
      return version.rename(name)
    },
  },

  Query: {
    async version(_, { version: versionId }) {
      // TODO need to make sure user should have access to this version
      const version = await Version.findById(versionId).populate('owner')
      if (!version) {
        throw new NotFoundError('Version', versionId)
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

    /** @deprecated Use renameVersion root mutation instead. */
    async rename(version, { name }) {
      return version.rename(name)
    },

    bibPreview({ bib }) {
      return previewEntries(bib)
    },

    bibliography({ bib = '' }) {
      return toEntries(bib)
    },

    yaml({ metadata = {} }, { options }) {
      const legacyMetadata = toLegacyFormat(metadata)
      const yaml = YAML.dump(legacyMetadata)
      return options?.strip_markdown
        ? reformat(yaml, { replaceBibliography: false })
        : yaml
    },

    async article(version, _args, context) {
      const articles = await Article.getArticles({
        filter: { versions: version._id },
        loaders: context.loaders,
      })
      if (articles.length === 0) {
        throw new NotFoundError('Version.article', version._id)
      }
      return articles[0]
    },
  },
}
