exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const users = mongo.collection('users')
  const usersCursor = users.find({})
  try {
    while (await usersCursor.hasNext()) {
      const user = await usersCursor.next()
      await users.updateOne(
        { _id: user._id },
        {
          $unset: {
            tags: '',
          },
        },
        { upsert: false }
      )
    }
  } catch (err) {
    console.log('Something went wrong while processing users', err)
    throw err
  } finally {
    await usersCursor.close()
  }
}

exports.down = function () {
  return null
}
