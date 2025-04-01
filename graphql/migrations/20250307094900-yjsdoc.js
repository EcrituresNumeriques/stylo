const config = require('../config.js')
const Y = require('yjs')

exports.up = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  try {
    const articles = mongo.collection('articles')
    const articlesCursor = articles.find({})
    try {
      while (await articlesCursor.hasNext()) {
        const article = await articlesCursor.next()
        const workingCopyYDoc = article.workingVersion.ydoc
        if (!workingCopyYDoc) {
          const collaborativeSession = article.collaborativeSession
          let yDoc
          if (collaborativeSession && collaborativeSession.id) {
            // article has an active collaborative session
            // create a yjs document from the collaborative session!
            yDoc = new Y.Doc()
            const docName = `ws/${collaborativeSession.id.toString()}`
            await applyUpdate(yDoc, docName)
            console.log(
              `Found an active collaborative session on article: ${article._id} with session id: ${collaborativeSession.id}`
            )
          } else {
            // create a yjs document from the working copy
            yDoc = new Y.Doc()
            const yText = yDoc.getText('main')
            yText.insert(0, article.workingVersion.md)
            console.log(
              `Create a yjs document from the working copy on article: ${article._id}`
            )
          }
          const documentState = Y.encodeStateAsUpdate(yDoc) // is a Uint8Array
          await articles.updateOne(
            { _id: article._id },
            {
              $set: {
                'workingVersion.ydoc':
                  Buffer.from(documentState).toString('base64'),
              },
            },
            { upsert: false }
          )
          yDoc.destroy()
        }
      }
    } catch (err) {
      console.log('Something went wrong while processing articles', err)
      throw err
    } finally {
      await articlesCursor.close()
    }
  } finally {
    mongo.close()
  }
}

exports.down = function () {
  return null
}

async function applyUpdate(ydoc, docName) {
  const LeveldbPersistence = require('y-leveldb').LeveldbPersistence
  const persistenceDir = config.get('collaboration.persistenceDataDirectory')
  const ldb = new LeveldbPersistence(persistenceDir)
  const persistedYdoc = await ldb.getYDoc(docName)
  const newUpdates = Y.encodeStateAsUpdate(ydoc)
  await ldb.storeUpdate(docName, newUpdates)
  Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc))
  await ldb.destroy()
}
