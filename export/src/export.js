const shell = require('shelljs')
const YAML = require('js-yaml')
const archiver = require('archiver')
const Article = require('./models/article')
const Version = require('./models/version')
const { normalize } = require('./helpers/filename')
const { prepareMetadata } = require('./helpers/metadata')
const { byTitle: sortByTitle } = require('./helpers/sort')
const Tag = require('./models/tag')

const canonicalBaseUrl = process.env.EXPORT_CANONICAL_BASE_URL

const exportZIP = ({ bib, yaml, md, id, title }, res, _) => {
  const filename = `${normalize(title)}.zip`
  const archive = archiver('zip', {
    zlib: { level: 9 },
  })
  archive.on('error', function (err) {
    res.status(500).send({ error: err.message })
  })
  archive.on('end', function () {
    console.log(`Wrote %d bytes in ${filename}`, archive.pointer())
  })
  res.attachment(filename)

  // pipe into the response
  archive.pipe(res)
  // add files
  archive.append(Buffer.from(md), { name: `${id}.md` })
  archive.append(Buffer.from(bib), { name: `${id}.bib` })
  archive.append(Buffer.from(prepareMetadata(yaml, id)), { name: `${id}.yaml` })
  // zip!
  archive.finalize()
}

const exportHTML = ({ bib, yaml, md, id, title }, res, req) => {
  let template = '../templates-stylo/templateHtml5.html5'
  if (req.query.preview) {
    template =
      '../templates-stylo/templateHtml5-preview.html5 -H ../templates-stylo/preview.html'
  }

  // add a canonical URL
  if (canonicalBaseUrl) {
    try {
      // the YAML contains a single document enclosed in "---" to satisfy pandoc
      // thereby, we need to use "load all":
      const docs = YAML.safeLoadAll(yaml, 'utf8')
      // add link-canonical to the first (and only) document
      const doc = docs[0]
      doc['link-canonical'] = canonicalBaseUrl + req.originalUrl
      // dump the result enclosed in "---"
      yaml = `---
${YAML.safeDump(doc)}
---
`
    } catch (e) {
      console.log('Unable to set the canonical URL', e)
    }
  }

  shell.cd('src/data')
  shell.exec(`rm ${id}*`)
  shell.echo(md).to(`${id}.md`)
  shell.echo(bib).to(`${id}.bib`)
  shell.echo(yaml).to(`${id}.yaml`)
  const pandoc = shell.exec(
    `pandoc ${id}.md ${id}.yaml --bibliography ${id}.bib --standalone --template=${template} --section-divs --ascii --toc --csl=../templates-stylo/chicagomodified.csl -f markdown -t html5 -o ${id}.html`
  ).code
  if (pandoc !== 0) {
    const html5 = shell.cat(`${id}.html`)
    return res.status(500).send(`${html5}`)
  }
  if (!req.query.preview) {
    res.set(
      'Content-Disposition',
      `attachment; filename="${normalize(title)}.html"`
    )
  }
  let html5 = shell.cat(`${id}.html`)
  if (canonicalBaseUrl && !html5.includes('<link rel="canonical"')) {
    // HACK! we add the link tag in the head!
    html5 = html5.replace(
      /(<head>\s?)/gs,
      `$1<link rel="canonical" href="${canonicalBaseUrl + req.originalUrl}">`
    )
  }

  shell.cd('../../')
  return res.send(`${html5}`)
}

class FindByIdNotFoundError extends Error {
  constructor(type, id) {
    super(`${type} with id: ${id} not found`)
    this.name = 'FindByIdNotFoundError'
  }
}

const errorHandler = (err, res) => {
  if (err && err.name === 'FindByIdNotFoundError') {
    res.status(404).send({ error: err.message })
  } else {
    res.status(500).send({ error: err })
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
  const { bib, yaml, md, _id: id } = latestVersion._doc
  return { bib, yaml, md, id, title: article._doc.title }
}

const getBookExportContext = async (bookId) => {
  const book = await getBookById(bookId)
  const { articles, bib, _id: id, name: title } = book._doc
  const chapters = await Article.find({
    _id: { $in: articles },
  }).populate('versions')
  // sort chapters in ascending alphabetical order
  const chaptersSorted = chapters.sort(sortByTitle)
  const mds = chaptersSorted.map(
    (c) => c.versions[c.versions.length - 1].md
  )
  const bibs = chaptersSorted.map(
    (c) => c.versions[c.versions.length - 1].bib
  )
  const firstChapter = chaptersSorted[0]
  const { yaml } = firstChapter.versions[firstChapter.versions.length - 1]
  return { bib: [bib, ...bibs].join('\n'), yaml: yaml, md: mds.join('\n\n'), id, title, }
}

module.exports = {
  exportArticleHtml: async (req, res, _) => {
    try {
      const articleId = req.params.id
      const articleExportContext = await getArticleExportContext(articleId)
      exportHTML(articleExportContext, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportArticleZip: async (req, res, _) => {
    try {
      const articleId = req.params.id
      const articleExportContext = await getArticleExportContext(articleId)
      exportZIP(articleExportContext, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportVersionHtml: async (req, res, _) => {
    try {
      const version = await getVersionById(req.params.id)
      const { bib, yaml, md, _id: id } = version._doc
      exportHTML({ bib, yaml, md, id, title: id }, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportVersionZip: async (req, res, _) => {
    try {
      const version = await getVersionById(req.params.id)
      const { bib, yaml, md, _id: id } = version._doc
      exportZIP({ bib, yaml, md, id, title: id }, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportBookHtml: async (req, res, _) => {
    try {
      const bookId = req.params.id
      const exportBookContext = await getBookExportContext(bookId)
      exportHTML(exportBookContext, res, req)
    } catch (err) {
      errorHandler(err, res)
    }
  },
  exportBookZip: async (req, res, _) => {
    try {
      const exportBookContext = await getBookExportContext(bookId)
      exportZIP(exportBookContext, res, req)
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
      const titles = articles.map((a) => ({
        title: a._doc.title,
        md: a._doc.versions[0].md,
        bib: a._doc.versions[0].bib,
        yaml: a._doc.versions[0].yaml,
      }))

      shell.cd('src/data')
      const dirName = returnTags.map((t) => normalize(t._doc.name)).join('-')
      shell.exec(`rm -R ${dirName}`)
      shell.exec(`rm ${dirName}.zip`)
      shell.exec(`mkdir ${dirName}`)
      titles.forEach((a) => {
        const filename = normalize(a.title)
        shell.echo(a.md).to(`${dirName}/${filename}.md`)
        shell.echo(a.bib).to(`${dirName}/${filename}.bib`)
        shell.echo(a.yaml).to(`${dirName}/${filename}.yaml`)
      })
      const ls = shell.ls(dirName)
      shell.exec(`zip ${dirName}.zip ${dirName}/*`)
      shell.exec(`rm -R ${dirName}`)
      shell.cd('../../')
      res.set('Content-Disposition', `attachment; filename="${dirName}.zip"`)
      return res.download(`${process.env.PWD}/src/data/${dirName}.zip`)
    } catch (err) {
      errorHandler(err, res)
    }
  },
}
