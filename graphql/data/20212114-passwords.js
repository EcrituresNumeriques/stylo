/* global print, Mongo */

const conn = Mongo()
const session = conn.startSession()
const db = conn.getDB('graphql')

session.startTransaction()

// 0. Resets any permission to populate them via the Password collection
db.users.updateMany({}, { $set: { permissions: [] } })

const cursor = db.passwords.find({})
while (cursor.hasNext()) {
  const password = cursor.next()
  const [ userId, ...sharedAccounts ] = password.users

  // 1. Move credentials from password to the user collection
  if (password.password) {
    db.users.updateOne({ _id: userId }, {
      $set: {
        password: password.password,
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

  // 2. Migrate the shared account thingy
  sharedAccounts.forEach(sharedWithUserId => {
    db.users.updateOne({ _id: sharedWithUserId }, {
      $addToSet: {
        acquintances: userId,
        permissions: {
          scope: 'user',
          roles: ['access', 'read', 'write'],
          // 'sharedWithUserId' account will have access to 'userId' account
          user: userId
        }
      }
    })
  })
}

session.commitTransaction()
