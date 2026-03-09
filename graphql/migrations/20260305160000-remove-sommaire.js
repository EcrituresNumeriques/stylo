exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const versions = mongo.collection('versions')
  const versionsCursor = versions.find({})
  try {
    while (await versionsCursor.hasNext()) {
      const version = await versionsCursor.next()
      await versions.updateOne(
        { _id: version._id },
        {
          $unset: {
            sommaire: '',
          },
        },
        { upsert: false }
      )
    }
  } catch (err) {
    console.log('Something went wrong while processing versions', err)
    throw err
  } finally {
    await versionsCursor.close()
  }
}

exports.down = function () {
  return null
}
