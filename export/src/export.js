const fs = require('fs').promises
const path = require('path')
const os = require('os')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const rimraf = require('rimraf')
const YAML = require('js-yaml')
const archiver = require('archiver')

const Article = require('./models/article')
const Version = require('./models/version')
const Tag = require('./models/tag')
const { normalize } = require('./helpers/filename')
const { prepare: prepareMetadata } = require('./helpers/metadata')
const { byTitle: sortByTitle } = require('./helpers/sort')

const canonicalBaseUrl = process.env.EXPORT_CANONICAL_BASE_URL

const exportZip = ({ bib, yaml, md, id, versionId, title }, res, _) => {
  const filename = `${normalize(title)}.zip`
  const archive = createZipArchive(filename, res)
  // add files
  archive.append(Buffer.from(md), { name: `${id}.md` })
  archive.append(Buffer.from(bib), { name: `${id}.bib` })
  archive.append(Buffer.from(prepareMetadata(yaml, {id: versionId ?? id, replaceBibliography: true})), { name: `${id}.yaml` })
  // zip!
  archive.finalize()
}

function generatePandocCommand (
  preview,
  markdownFilePath,
  bibliographyFilePath,
  metadataFilePath
) {
  const templatesDirPath = path.join(__dirname, 'templates-stylo')
  let templateArg = `--template=${path.join(
    templatesDirPath,
    'templateHtml5.html5'
  )}`
  if (preview) {
    templateArg = `--template=${path.join(
      templatesDirPath,
      'templateHtml5-preview.html5'
    )} -H ${path.join(templatesDirPath, 'preview.html')}`
  }
  const cslFilePath = path.join(templatesDirPath, 'chicagomodified.csl')
  return `pandoc ${metadataFilePath} ${markdownFilePath} \
--bibliography=${bibliographyFilePath} \
--standalone \
${templateArg} \
--section-divs \
--ascii \
--toc \
--csl=${cslFilePath} \
-f markdown \
-t html5`
}

const exportHtml = async ({ bib, yaml, md, id, versionId, title }, res, req) => {
  const preview = req.query.preview
  const originalUrl = req.originalUrl

  let tmpDirectory
  try {
    tmpDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'stylo-'))
    // write files into the temporary directory
    const markdownFilePath = path.join(tmpDirectory, `${id}.md`)
    const bibliographyFilePath = path.join(tmpDirectory, `${id}.bib`)
    const metadataFilePath = path.join(tmpDirectory, `${id}.yaml`)
    await fs.writeFile(markdownFilePath, md, 'utf8')
    await fs.writeFile(bibliographyFilePath, bib, 'utf8')
    await fs.writeFile(metadataFilePath, prepareMetadata(yaml, { id: versionId ?? id }), 'utf8')
    // pandoc command
    const pandocCommand = generatePandocCommand(
      preview,
      markdownFilePath,
      bibliographyFilePath,
      metadataFilePath
    )
    const FIFTEEN_MEGABYTES = 15 * 1024 * 1024
    const { stdout, stderr } = await exec(pandocCommand, { maxBuffer: FIFTEEN_MEGABYTES })
    if (stderr) {
      console.warn(stderr)
    }
    if (!preview) {
      res.attachment(`${normalize(title)}.html`)
    }
    let html5 = stdout
    if (canonicalBaseUrl && !html5.includes('<link rel="canonical"')) {
      // HACK! we add the link tag in the head!
      html5 = html5.replace(
        /(<head>\s?)/gs,
        `$1<link rel="canonical" href="${canonicalBaseUrl + originalUrl}">`
      )
    }
    res.send(html5)
  } catch (err) {
    console.log({ err })
    res.status(500).send({ error: err })
  } finally {
    if (tmpDirectory) {
      rimraf(tmpDirectory, (err) => {
        if (err) {
          console.error(
            `Unable to remove temporary directory: ${tmpDirectory} - error: ${err}`
          )
        }
      })
    }
  }
}

class FindByIdNotFoundError extends Error {
  constructor (type, id) {
    super(`${type} with id: ${id} not found`)
    this.name = 'FindByIdNotFoundError'
  }
}

const errorHandler = (err, res) => {
  if (err && err.name === 'FindByIdNotFoundError') {
    res.status(404).send({ error: { message: err.message } })
  } else {
    let error
    if (err) {
      error = {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    } else {
      error = {}
    }
    res.status(500).send({ error })
  }
}

const getArticleById = async (articleId) => {
  const article = await Article.findById(articleId)
  if (!article) {
    throw new FindByIdNotFoundError('Article', articleId)
  }
  return article
}

const getVersionById = async (versionId) => {
  const article = await Version.findById(versionId)
  if (!article) {
    throw new FindByIdNotFoundError('Version', versionId)
  }
  return article
}

const getBookById = async (bookId) => {
  const book = await Tag.findById(bookId)
  if (!book) {
    throw new FindByIdNotFoundError('Book', bookId)
  }
  return book
}

const getArticleExportContext = async (articleId) => {
  const article = await getArticleById(articleId)
  const latestVersionId = article._doc.versions.pop()
  const latestVersion = await getVersionById(latestVersionId)
  const { bib, yaml, md } = latestVersion._doc
  return { bib, yaml, md, id: articleId, versionId: latestVersionId, title: article._doc.title }
}

const getBookExportContext = async (bookId) => {
  const book = await getBookById(bookId)
  const { articles, bib, _id: id, name: title } = book._doc
  const chapters = await Article.find({
    _id: { $in: articles },
  }).populate('versions')
  // sort chapters in ascending alphabetical order
  const chaptersSorted = chapters.sort(sortByTitle)
  const mds = chaptersSorted.map((c) => c.versions[c.versions.length - 1].md)
  const bibs = chaptersSorted.map((c) => c.versions[c.versions.length - 1].bib)
  const firstChapter = chaptersSorted[0]
  const { yaml } = firstChapter.versions[firstChapter.versions.length - 1]
  return {
    bib: [bib, ...bibs].join('\n'),
    yaml: yaml,
    md: mds.join('\n\n'),
    id,
    title,
  }
}

const createZipArchive = (filename, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  archive.on('error', function (err) {
    res.status(500).send({ error: err.message })
  })
  archive.on('end', function () {
    console.log(`Wrote %d bytes in ${filename}`, archive.pointer())
  })
  // pipe into the response
  archive.pipe(res)
  res.attachment(filename)
  return archive
}

module.exports = {
  exportArticleHtml: async (req, res, _) => {
    try {
      const articleId = req.params.id
      const articleExportContext = await getArticleExportContext(articleId)
      await exportHtml(articleExportContext, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportArticleZip: async (req, res, _) => {
    try {
      const articleId = req.params.id
      const articleExportContext = await getArticleExportContext(articleId)
      exportZip(articleExportContext, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportVersionHtml: async (req, res, _) => {
    try {
      const version = await getVersionById(req.params.id)
      const { bib, yaml, md, _id: id } = version._doc
      await exportHtml({ bib, yaml, md, id, title: id }, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportVersionZip: async (req, res, _) => {
    try {
      const version = await getVersionById(req.params.id)
      const { bib, yaml, md, _id: id } = version._doc
      exportZip({ bib, yaml, md, id, title: id }, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportBookHtml: async (req, res, _) => {
    try {
      const bookId = req.params.id
      const exportBookContext = await getBookExportContext(bookId)
      await exportHtml(exportBookContext, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportBookZip: async (req, res, _) => {
    try {
      const bookId = req.params.id
      const exportBookContext = await getBookExportContext(bookId)
      exportZip(exportBookContext, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportBatchTagZip: async (req, res) => {
    try {
      const tags = req.params.ids.split(',')
      const returnTags = await Tag.find({ _id: { $in: tags } })
      const articles = await Article.find({ tags: { $all: tags } }).populate({
        path: 'versions',
        options: { limit: 1, sort: { updatedAt: -1 } },
      })
      const name = returnTags.map((t) => normalize(t._doc.name)).join('-')
      const filename = `${name}.zip`
      const archive = createZipArchive(filename, res)
      // add files
      articles.forEach((article) => {
        const filename = normalize(article._doc.title)
        const { md, bib, yaml } = article._doc.versions[0]
        archive.append(Buffer.from(md), { name: `${filename}.md` })
        archive.append(Buffer.from(bib), { name: `${filename}.bib` })
        archive.append(Buffer.from(yaml), { name: `${filename}.yaml` })
      })
      // zip!
      archive.finalize()
    } catch (err) {
      errorHandler(err, res)
    }
  },
}
