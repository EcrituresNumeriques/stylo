import YAML from 'js-yaml'
import mongoose from 'mongoose'
import { requireArgument } from '../helpers/arguments.js'
import { previewEntries } from '../helpers/bibliography.js'
import { toEntries } from '../helpers/bibtex.js'
import { NotFoundError } from '../helpers/errors.js'
import { reformat, toLegacyFormat } from '../helpers/metadata.js'
import Article from '../models/article.js'
import Version from '../models/version.js'

export const Mutation = {
  async renameVersion(_, { versionId, name }) {
    // TODO need to make sure user should have access to this version
    const version = await Version.findById(versionId)
    if (!version) {
      throw new NotFoundError('Version', versionId)
    }
    return version.rename(name)
  },
}

export const Query = {
  async version(_, args) {
    const versionId = requireArgument('versionId', args.versionId, args.version)
    // TODO need to make sure user should have access to this version
    const version = await Version.findById(versionId).populate('owner')
    if (!version) {
      throw new NotFoundError('Version', versionId)
    }
    return version
  },
}

const VersionResolver = {
  async owner(version, _args, context) {
    if (version instanceof mongoose.Document && version.populated('owner')) {
      return version.owner
    }
    return context.loaders.users.load(version.owner._id)
  },

  /** @deprecated Use renameVersion root mutation instead. */
  async rename(version, { name }) {
    await version.rename(name)
    return true
  },

  bibPreview({ bib }) {
    return previewEntries(bib)
  },

  bibliography({ bib }) {
    // the bibliography may be null: the field is non-nullable, return an empty list
    return toEntries(bib ?? '')
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
}

export { VersionResolver as Version }
