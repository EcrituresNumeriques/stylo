const config = require('./config.js')
const archiver = require('archiver')
const { readFile } = require('node:fs/promises')
const { join } = require('node:path')
const { logger } = require('./logger')
const { FindByIdNotFoundError } = require('./helpers/errors')
const { normalize } = require('./helpers/filename')
const { getArticleById, getVersionById, getCorpusById } = require('./graphql')

const canonicalBaseUrl = config.get('export.canonicalBaseUrl')
const exportEndpoint = config.get('export.urlEndpoint')

const exportZip = async ({ bib, yaml, md, id, versionId, title }, res, _) => {
  const filename = `${normalize(title)}.zip`
  const archive = createZipArchive(filename, res)
  // add files
  archive.append(Buffer.from(md), { name: `${id}.md` })
  archive.append(Buffer.from(bib), { name: `${id}.bib` })
  archive.append(Buffer.from(yaml), { name: `${id}.yaml` })
  // zip!
  return archive.finalize()
}

/**
 *
 * @param {{md_content: String, bib_content: String, yaml_content: String, bibliography_style: String, with_toc: Boolean}} bodyOptions
 * @returns {Promise<String>}
 */
async function getStyloExportHtmlOutput (bodyOptions) {
  const body = new FormData()
  Object.entries(bodyOptions).forEach(([key, value]) => body.append(key, value))

  return fetch(`${exportEndpoint}/api/article_preview`, {
    method: 'POST',
    body
  }).then(response => response.text())
}

const exportHtml = async ({ bib, yaml, md, id, versionId, title }, res, req) => {
  const preview = Boolean(req.query.preview)
  const originalUrl = req.originalUrl

  let html5 = await getStyloExportHtmlOutput({
    md_content: md,
    bib_content: bib,
    yaml_content: yaml,
    with_toc: preview,
    bibliography_style: 'chicagomodified'
  })

  if (canonicalBaseUrl && !html5.includes('<link rel="canonical"')) {
    // HACK! we add the link tag in the head!
    html5 = html5.replace(
      /(<head>\s?)/gs,
      `$1<link rel="canonical" href="${canonicalBaseUrl + originalUrl}">`
    )
  }

  /**
   * HTML Preview can be both for an Article export and the Article Preview (read: proofread with Hypothesis annotations)
   * The `preview` argument controls in which context we display the output
   */
  if (preview) {
    const previewStylesheet = await readFile(join(__dirname, 'assets', 'preview.css'), { encoding: 'utf8' })

    html5 = html5.replace(/(<\/head>\s?)/gs, `<meta name="robots" content="noindex, nofollow"/>
  <style type="text/css">${previewStylesheet}</style>
  $1`
    )

    html5 = html5.replace(/<\/body>/, `<script type="application/json" class="js-hypothesis-config">
    {
      "openSidebar": false
    }
  </script>
  <script src="https://hypothes.is/embed.js" async></script>
  </body>`)

    return res.send(html5)
  }

  res.attachment(`${normalize(title)}.html`)
}

const getArticleExportContext = async (articleId) => {
  const article = await getArticleById(articleId)
  const latestVersion = article.workingVersion
  const { bib, yaml, md } = latestVersion
  return { bib, yaml, md, articleId, title: article.title }
}

const getBookExportContext = async (bookId) => {
  const book = await getCorpusById(bookId)

  const { articles: chapters, _id: id, name: title } = book

  // we can create empty books… but no need to preview them
  if (chapters.length === 0) {
    return null
  }

  return createBookExportContext(chapters, { id, title })
}

function createBookExportContext (chapters, { id, title }) {
  // sort chapters in ascending alphabetical order
  const chaptersSorted = chapters.sort((a, b) => a.order - b.order).map((c) => c.article)
  const chaptersData = chaptersSorted.reduce((acc, chapter) => {
    const workingVersion = chapter.versions.length > 0
      ? chapter.versions[0] // versions ordered by creation date descending (first version is the latest version)
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
  createBookExportContext,

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
      return exportHtml({ ...articleExportContext, id: identifier }, res, req)
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
      return exportZip({ ...articleExportContext, id: identifier }, res, req)
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
  }
}
