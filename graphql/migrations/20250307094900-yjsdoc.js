const { getYDoc } = require('y-websocket/bin/utils')
const Y = require("yjs");

exports.up = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  try {
    const articles = mongo.collection('articles')
    const articlesCursor = articles.find({})
    while (await articlesCursor.hasNext()) {
      const article = await articlesCursor.next()
      const ydoc = article.workingVersion.ydoc
      const articleId = article._id
      if (!ydoc) {
        const yDoc = getYDoc(`ws/${articleId.toString()}`)
        const yText = yDoc.getText('main')
        yText.insert(0, article.workingVersion.md)
        const documentState = Y.encodeStateAsUpdate(yDoc) // is a Uint8Array
        await articles.updateOne(
          { _id: article._id },
          {
            $set: {
              'workingVersion.ydoc': Buffer.from(documentState).toString('base64'),
            },
          },
          { upsert: false }
        )
      }
    }
    await articlesCursor.close()
  } finally {
    mongo.close()
  }
}

exports.down = function () {
  return null
}
