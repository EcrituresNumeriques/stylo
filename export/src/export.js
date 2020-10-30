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
    template = '../templates-stylo/templateHtml5-preview.html5 -H ../templates-stylo/preview.html'
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
  const pandoc = shell.exec(`pandoc ${id}.md ${id}.yaml --bibliography ${id}.bib --standalone --template=${template} --section-divs --ascii --toc --csl=../templates-stylo/chicagomodified.csl -f markdown -t html5 -o ${id}.html`).code
  if (pandoc !== 0) {
    const html5 = shell.cat(`${id}.html`)
    return res.status(500).send(`${html5}`)
  }
  if (!req.query.preview) {
    res.set('Content-Disposition', `attachment; filename="${normalize(title)}.html"`)
  }
  let html5 = shell.cat(`${id}.html`)
  if (canonicalBaseUrl && !html5.includes('<link rel="canonical"')) {
    // HACK! we add the link tag in the head!
    html5 = html5.replace(/(<head>\s?)/gs, `$1<link rel="canonical" href="${canonicalBaseUrl + req.originalUrl}">`)
  }

  shell.cd('../../')
  return res.send(`${html5}`)
}

module.exports = {
  exportArticleHtml: async (req, res, next) => {
    try {
      const article = await Article.findById(req.params.id)
      if (!article) {
        throw new Error('Article Not found')
      }
      const versionID = article._doc.versions[article._doc.versions.length - 1]
      const version = await Version.findById(versionID)
      if (!version) {
        throw new Error('Version not found')
      }
      const cleanedVersion = version._doc

      exportHTML({ bib: cleanedVersion.bib, yaml: cleanedVersion.yaml, md: cleanedVersion.md, id: cleanedVersion._id, title: article._doc.title }, res, req)

    } catch (err) {
      res.status(404).send(err)
    }
  },
  exportArticleZip: async (req, res, next) => {
    try {
      const article = await Article.findById(req.params.id)
      if (!article) {
        throw new Error('Article Not found')
      }
      const versionID = article._doc.versions[article._doc.versions.length - 1]
      const version = await Version.findById(versionID)
      if (!version) {
        throw new Error('Version not found')
      }
      const cleanedVersion = version._doc

      exportZIP({ bib: cleanedVersion.bib, yaml: cleanedVersion.yaml, md: cleanedVersion.md, id: cleanedVersion._id, title: article._doc.title }, res, req)

    } catch (err) {
      res.status(404).send(err)
    }
  },
  exportVersionHtml: async (req, res, next) => {
    try {
      const version = await Version.findById(req.params.id)
      if (!version) {
        throw new Error('Version not found')
      }
      const cleanedVersion = version._doc

      exportHTML({ bib: cleanedVersion.bib, yaml: cleanedVersion.yaml, md: cleanedVersion.md, id: cleanedVersion._id, title: cleanedVersion._id }, res, req)

    } catch (err) {
      res.status(404).send(err)
    }

  },
  exportVersionZip: async (req, res, next) => {
    try {
      const version = await Version.findById(req.params.id)
      if (!version) {
        throw new Error('Version not found')
      }
      const cleanedVersion = version._doc

      exportZIP({ bib: cleanedVersion.bib, yaml: cleanedVersion.yaml, md: cleanedVersion.md, id: cleanedVersion._id, title: cleanedVersion._id }, res, req)

    } catch (err) {
      res.status(404).send(err)
    }
  },
  exportBookHtml: async (req, res, next) => {
    try {
      const book = await Tag.findById(req.params.id)
      if (!book) {
        throw new Error('Book not found')
      }
      const cleanedBook = book._doc

      // get the mashed md of all last version of all chapters
      const chapters = await Article.find({ _id: { $in: cleanedBook.articles } }).populate('versions')

      // sort chapters in ascending alphabetical order
      const chaptersSorted = chapters.sort(sortByTitle)
      const mds = chaptersSorted.map(c => c.versions[c.versions.length - 1].md)
      const bibs = chaptersSorted.map(c => c.versions[c.versions.length - 1].bib)
      const firstChapter = chaptersSorted[0]
      const yaml = firstChapter.versions[firstChapter.versions.length - 1].yaml

      exportHTML({ bib: [cleanedBook.bib, ...bibs].join('\n'), yaml: yaml, md: mds.join('\n\n'), id: cleanedBook._id, title: cleanedBook.name }, res, req)

    } catch (err) {
      res.status(404).send(err)
    }
  },
  exportBookZip: async (req, res, next) => {
    try {
      const book = await Tag.findById(req.params.id)
      if (!book) {
        throw new Error('Book not found')
      }
      const cleanedBook = book._doc

      // get the mashed md of all last version of all chapters
      const chapters = await Article.find({ _id: { $in: cleanedBook.articles } }).populate('versions')

      // sort chapters in ascending alphabetical order
      const chaptersSorted = chapters.sort(sortByTitle)
      const mds = chaptersSorted.map(c => c.versions[c.versions.length - 1].md)
      const bibs = chaptersSorted.map(c => c.versions[c.versions.length - 1].bib)
      const firstChapter = chaptersSorted[0]
      const yaml = firstChapter.versions[firstChapter.versions.length - 1].yaml

      exportZIP({ bib: [cleanedBook.bib, ...bibs].join('\n'), yaml: yaml, md: mds.join('\n\n'), id: cleanedBook._id, title: cleanedBook.name }, res, req)

    } catch (err) {
      res.status(404).send(err)
    }
  },
  exportBatchTagZip: async (req, res) => {
    try {
      const tags = req.params.ids.split(',')
      const returnTags = await Tag.find({ _id: { $in: tags } })

      const articles = await Article.find({ tags: { $all: tags } }).populate({ path: 'versions', options: { limit: 1, sort: { updatedAt: -1 } } })
      const titles = articles.map(a => ({ title: a._doc.title, md: a._doc.versions[0].md, bib: a._doc.versions[0].bib, yaml: a._doc.versions[0].yaml }))

      shell.cd('src/data')
      const dirName = returnTags.map(t => normalize(t._doc.name)).join('-')
      shell.exec(`rm -R ${dirName}`)
      shell.exec(`rm ${dirName}.zip`)
      shell.exec(`mkdir ${dirName}`)
      titles.forEach(a => {
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
      res.status(404).send(err)
    }
  }
}
