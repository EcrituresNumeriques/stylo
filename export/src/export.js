const fs = require('fs').promises
const path = require('path')
const os = require('os')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const YAML = require('js-yaml')
const archiver = require('archiver')

const { logger } = require('./logger')
const { FindByIdNotFoundError } = require('./helpers/errors')
const { normalize } = require('./helpers/filename')
const { prepare: prepareMetadata } = require('./helpers/metadata')
const { byTitle: sortByTitle } = require('./helpers/sort')
const { getArticleById, getVersionById, getBookById } = require('./graphql')

const canonicalBaseUrl = process.env.EXPORT_CANONICAL_BASE_URL

const exportZip = async ({ bib, yaml, md, id, versionId, title }, res, _) => {
  const filename = `${normalize(title)}.zip`
  const archive = createZipArchive(filename, res)
  // add files
  archive.append(Buffer.from(md), { name: `${id}.md` })
  archive.append(Buffer.from(bib), { name: `${id}.bib` })
  archive.append(Buffer.from(prepareMetadata(yaml, {id: versionId ?? id, replaceBibliography: true})), { name: `${id}.yaml` })
  // zip!
  return archive.finalize()
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

    await Promise.all([
      fs.writeFile(markdownFilePath, md, 'utf8'),
      fs.writeFile(bibliographyFilePath, bib, 'utf8'),
      fs.writeFile(metadataFilePath, prepareMetadata(yaml, { id: versionId ?? id }), 'utf8'),
    ])

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
      logger.warn(stderr)
    }
    let html5 = stdout
    if (canonicalBaseUrl && !html5.includes('<link rel="canonical"')) {
      // HACK! we add the link tag in the head!
      html5 = html5.replace(
        /(<head>\s?)/gs,
        `$1<link rel="canonical" href="${canonicalBaseUrl + originalUrl}">`
      )
    }

    if (preview) {
      html5 = html5.replace(/<\/body>/, () => {
        return `<script type="application/json" class="js-hypothesis-config">
      {
        "openSidebar": true
      }
    </script>
    <script src="https://hypothes.is/embed.js" async></script>
    </body>`
      })
    } else {
      res.attachment(`${normalize(title)}.html`)
    }

    res.send(html5)
  } finally {
    if (tmpDirectory) {
      await fs.rm(tmpDirectory, { recursive: true, maxRetries: 3 })
    }
  }
}

const getArticleExportContext = async (articleId) => {
  const article = await getArticleById(articleId)
  const latestVersion = article.workingVersion
  const { bib, yaml, md } = latestVersion
  return { bib, yaml, md, articleId, title: article.title }
}

const getBookExportContext = async (bookId) => {
  const book = await getBookById(bookId)
  const { articles: chapters, _id: id, name: title } = book

  // we can create empty books… but no need to preview them
  if (chapters.length === 0) {
    return null
  }

  return createBookExportContext(chapters, { id, title })
}

function createBookExportContext (chapters, { id, title }) {
  // sort chapters in ascending alphabetical order
  const chaptersSorted = chapters.sort(sortByTitle)
  const chaptersData = chaptersSorted.reduce((acc, chapter) => {
    const workingVersion = chapter.versions.length > 0
      ? chapter.versions[chapter.versions.length - 1]
      : chapter.workingVersion
    acc.bib.push(workingVersion.bib)
    acc.md.push(workingVersion.md)
    return acc
  }, { bib: [], md: [] })
  const firstChapter = chaptersSorted[0]
  const { yaml } = firstChapter.versions.length > 0
    ? firstChapter.versions[firstChapter.versions.length - 1]
    : firstChapter.workingVersion

  return {
    bib: chaptersData.bib.join('\n'),
    yaml: yaml,
    md: chaptersData.md.join('\n\n'),
    id,
    title,
  }
}

const createZipArchive = (filename, res) => {
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })

  archive.on('end', function () {
    logger.info(`Wrote %d bytes in ${filename}`, archive.pointer())
  })

  // pipe into the response
  archive.pipe(res)
  res.attachment(filename)

  return archive
}

module.exports = {
  exportArticleHtml: async (req, res, _) => {
    const articleId = req.params.id
    const articleExportContext = await getArticleExportContext(articleId)
    return exportHtml({ ...articleExportContext, id: articleExportContext.articleId }, res, req)
  },

  exportArticleZip: async (req, res, _) => {
    const articleId = req.params.id
    const articleExportContext = await getArticleExportContext(articleId)
    return exportZip({ ...articleExportContext, id: articleExportContext.articleId }, res, req)
  },

  exportVersionHtml: async (req, res, _) => {
    const identifier = req.params.id
    try {
      const articleExportContext = await getArticleExportContext(identifier)
      exportHtml({ ...articleExportContext, id: identifier }, res, req)
    } catch (e) {
      if (e instanceof FindByIdNotFoundError) {
        // it might be a version!
        const { bib, yaml, md, _id: id } = await getVersionById(identifier)
        return exportHtml({ bib, yaml, md, id, title: id }, res, req)
      } else {
        throw e
      }
    }
  },

  exportVersionZip: async (req, res, _) => {
    const identifier = req.params.id

    try {
      const articleExportContext = await getArticleExportContext(identifier)
      await exportZip({ ...articleExportContext, id: identifier }, res, req)
    } catch (e) {
      if (e instanceof FindByIdNotFoundError) {
        // it might be a version!
        const version = await getVersionById(identifier)
        const { bib, yaml, md, _id: id } = version
        return exportZip({ bib, yaml, md, id, title: id }, res, req)
      } else {
        throw e
      }
    }
  },

  exportBookHtml: async (req, res, _) => {
    const exportBookContext = await getBookExportContext(req.params.id)
    if (exportBookContext === null) {
      return res.status(200).send('')
    }

    return exportHtml(exportBookContext, res, req)
  },

  exportBookZip: async (req, res, _) => {
    const bookId = req.params.id
    const exportBookContext = await getBookExportContext(bookId)
    return exportZip(exportBookContext, res, req)
  },

  exportBatchTagZip: async (req, res) => {
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
      const { md, bib, yaml } = article._doc.versions.length > 0
        ? article._doc.versions[0]
        : article._doc.workingVersion
      archive.append(Buffer.from(md), { name: `${filename}.md` })
      archive.append(Buffer.from(bib), { name: `${filename}.bib` })
      archive.append(Buffer.from(yaml), { name: `${filename}.yaml` })
    })
    return archive.finalize()
  },
  _createBookExportContext: createBookExportContext
}
