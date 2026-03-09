exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const tags = mongo.collection('tags')
  const tagsCursor = tags.find({})
  try {
    while (await tagsCursor.hasNext()) {
      const tag = await tagsCursor.next()
      await tags.updateOne(
        { _id: tag._id },
        {
          $unset: {
            bib: '',
            yaml: '',
          },
        },
        { upsert: false }
      )
    }
  } catch (err) {
    console.log('Something went wrong while processing tags', err)
    throw err
  } finally {
    await tagsCursor.close()
  }
}

exports.down = function () {
  return null
}
