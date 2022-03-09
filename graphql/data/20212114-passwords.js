/* global Mongo, ObjectId, db */

const conn = Mongo()
const session = conn.startSession()

session.startTransaction()

// 0. Resets any permission to populate them via the Password collection
db.users.updateMany({}, { $set: { permissions: [] } })

const cursor = db.users.find({})

while (cursor.hasNext()) {
  const user = cursor.next()
  const userId = user._id
  if (typeof user.passwords === 'undefined') {
    // new account, migration is not required
    continue
  }
  const [ userPasswordId, ...otherPasswordIds ] = user.passwords
  const userPassword = db.passwords.findOne({_id: userPasswordId})
  const canAccessAcccountIds = userPassword.users.filter((id) => id.toString() !== userId.toString())

  // 1. Move credentials from password to the user collection
  if (userPassword.password) {
    db.users.updateOne({ _id: userId }, {
      $set: {
        password: userPassword.password,
        authType: 'local',
        permissions: []
      }
    })
  }
  else {
    db.users.updateOne({ _id: userId }, {
      $set: {
        password: null,
        authType: 'oidc',
        permissions: []
      }
    })
  }

  // 2. current user can access other account
  for (const canAccessAccountId of canAccessAcccountIds) {
    db.users.updateOne({ _id: canAccessAccountId }, {
      $addToSet: {
        acquintances: userId,
        permissions: {
          scope: 'user',
          roles: ['access', 'read', 'write'],
          // 'userId' account will have access to 'canAccessAccountId' account
          user: userId,
          _id: ObjectId()
        }
      }
    })
  }

  // 3. other account can access current user
  otherPasswordIds.forEach(otherPasswordId => {
    const otherUser = db.users.findOne({"passwords.0": otherPasswordId })
    db.users.updateOne({ _id: userId }, {
      $addToSet: {
        acquintances: otherUser._id,
        permissions: {
          scope: 'user',
          roles: ['access', 'read', 'write'],
          // 'otherUser._id' account will have access to 'userId' account
          user: otherUser._id,
          _id: ObjectId()
        }
      }
    })
  })
}

session.commitTransaction()
