exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const corpus = mongo.collection('corpus')
  await corpus.updateMany(
    { type: { $exists: true } },
    {
      $set: {
        type: 'neutral',
      },
    }
  )
}

exports.down = async function (db) {
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
