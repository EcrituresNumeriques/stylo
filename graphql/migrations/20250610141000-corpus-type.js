exports.up = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  const corpus = mongo.collection('corpus')
  await corpus.updateMany(
    { type: { $exists: false } },
    {
      $set: {
        type: 'neutral',
      },
    }
  )
}

exports.down = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  const corpus = mongo.collection('corpus')
  await corpus.updateMany(
    { type: { $exists: true } },
    {
      $unset: {
        type: '',
      },
    }
  )
}
