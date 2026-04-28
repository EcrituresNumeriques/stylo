const archiver = require('archiver')
const { logger } = require('../logger')

/**
 * Creates a zip Buffer from a list of structured articles.
 * Each article is stored as:
 * articles/
 *   {articleId}/
 *     info.json
 *     latest/
 *       article.md
 *       bibliography.bib
 *       metadata.json
 *     {version}.{revision}/
 *       article.md
 *       bibliography.bib
 *       metadata.json
 *
 * @param {Array<{id: string, info: object, latest: object, versions: object}>} articles - Structured articles (as returned by `getArticles`)
 * @returns {Promise<Buffer>}
 */
async function zip(articles) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks = []

    archive.on('data', (chunk) => chunks.push(chunk))
    archive.on('end', () => resolve(Buffer.concat(chunks)))
    archive.on('error', (err) => {
      logger.error({ err }, 'Something went wrong while zipping articles')
      reject(err)
    })

    for (const article of articles) {
      const id = article.id

      archive.append(JSON.stringify(article.info, null, 2), {
        name: `articles/${id}/info.json`,
      })
      archive.append(article.latest.article, {
        name: `articles/${id}/latest/article.md`,
      })
      archive.append(article.latest.bibliography, {
        name: `articles/${id}/latest/bibliography.bib`,
      })
      archive.append(JSON.stringify(article.latest.metadata, null, 2), {
        name: `articles/${id}/latest/metadata.json`,
      })

      Object.entries(article.versions).forEach(([key, value]) => {
        archive.append(JSON.stringify(value.info, null, 2), {
          name: `articles/${id}/${key}/info.json`,
        })
        archive.append(value.article, {
          name: `articles/${id}/${key}/article.md`,
        })
        archive.append(value.bibliography, {
          name: `articles/${id}/${key}/bibliography.bib`,
        })
        archive.append(JSON.stringify(value.metadata, null, 2), {
          name: `articles/${id}/${key}/metadata.json`,
        })
      })
    }

    archive.finalize().catch((err) => {
      console.log({ err })
      reject(err)
    })
  })
}

module.exports = { zip }
