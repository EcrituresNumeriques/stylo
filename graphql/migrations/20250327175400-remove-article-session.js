exports.up = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  try {
    const articles = mongo.collection('articles')
    const articlesCursor = articles.find({})
    while (await articlesCursor.hasNext()) {
      const article = await articlesCursor.next()
      await articles.updateOne(
        { _id: article._id },
        {
          $unset: {
            collaborativeSession: '',
            soloSession: '',
          },
        },
        { upsert: false }
      )
    }
    await articlesCursor.close()
  } finally {
    mongo.close()
  }
}

exports.down = function () {
  return null
}
