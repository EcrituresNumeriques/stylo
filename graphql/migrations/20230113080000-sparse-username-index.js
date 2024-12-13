exports.up = async function (db) {
  const mongo = await db._run("getDbInstance", true)
  try {
    const users = mongo.collection("users")
    const duplicateUsernameList = await users.aggregate([
      {
        $match: {
          "username": {
            "$exists": true
          }
        }
      },
      {
        $group: {
          _id: "$username",
          count: {
            $sum: 1
          },
          duplicates: {
            $addToSet: "$_id"
          }
        }
      },
      {
        $match: {
          count: {
            $gt: 1
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          email: "$email",
          duplicates: 1
        }
      }
    ]).toArray()
    // update user with non-unique username
    for (const item of duplicateUsernameList) {
      for (const duplicate of item.duplicates) {
        console.log(`Username ${item.name} is non unique, update username to email on user with id: ${duplicate}`)
        await users.updateOne(
          { _id: duplicate },
          [{
            $set: {
              username: "$email"
            }
          }]
        )
      }
    }
    await users.createIndex({ username: 1 }, { sparse: true, unique: true })
  } finally {
    await mongo.close()
  }
}

exports.down = async function (db) {
  return db.removeIndex('users', 'username_1')
}
