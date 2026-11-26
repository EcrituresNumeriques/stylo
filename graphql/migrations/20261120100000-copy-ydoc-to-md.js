// Copy the Markdown of each Y.js document into workingVersion.md,
// so that the search (text index on workingVersion.md) finds the contents.
// Example only: workingVersion.md is not kept up to date with Y.js afterwards.
const { getTextFromYjsDoc } = require('../helpers/yjs-utils.mjs')

const BATCH_SIZE = 500

exports.up = async function (db) {
  if (db.internals.dryRun) return
  const articles = db._getDbInstance().collection('articles')
  const cursor = articles.find(
    { 'workingVersion.ydoc': { $type: 'string', $ne: '' } },
    { projection: { 'workingVersion.ydoc': 1 } }
  )
  let copied = 0
  let unreadable = 0
  let batch = []
  try {
    for await (const { _id, workingVersion } of cursor) {
      let md
      try {
        md = getTextFromYjsDoc(workingVersion.ydoc)
      } catch {
        unreadable++
        continue
      }
      batch.push({
        updateOne: {
          filter: { _id },
          update: { $set: { 'workingVersion.md': md } },
        },
      })
      if (batch.length === BATCH_SIZE) {
        await articles.bulkWrite(batch, { ordered: false })
        copied += batch.length
        batch = []
      }
    }
    if (batch.length > 0) {
      await articles.bulkWrite(batch, { ordered: false })
      copied += batch.length
    }
  } finally {
    await cursor.close()
  }
  console.log(
    `${copied} Y.js documents copied into workingVersion.md, ${unreadable} unreadable`
  )
}

exports.down = function () {
  return null
}
