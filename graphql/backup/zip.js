const archiver = require('archiver')

/**
 * Creates a zip Buffer from a list of articles.
 * Each article is stored as:
 *   {articleId}/
 *     info.json
 *     latest/
 *       article.md
 *       bibliography.bib
 *       metadata
 *
 * @param {Array} articles - Mongoose Article documents (with workingVersion populated)
 * @returns {Promise<Buffer>}
 */
async function zip(articles) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks = []

    archive.on('data', (chunk) => chunks.push(chunk))
    archive.on('end', () => resolve(Buffer.concat(chunks)))
    archive.on('error', (err) => reject(err))

    for (const article of articles) {
      const id = String(article._id)
      const wv = article.workingVersion ?? {}

      const info = {
        _id: id,
        title: article.title,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        zoteroLink: article.zoteroLink,
        nakalaLink: article.nakalaLink,
      }

      archive.append(JSON.stringify(info, null, 2), {
        name: `${id}/info.json`,
      })
      archive.append(wv.md ?? '', {
        name: `${id}/latest/article.md`,
      })
      archive.append(wv.bib ?? '', {
        name: `${id}/latest/bibliography.bib`,
      })
      archive.append(wv.yaml ?? '', {
        name: `${id}/latest/metadata.yaml`,
      })
    }

    archive.finalize().catch(reject)
  })
}

module.exports = { zip }
