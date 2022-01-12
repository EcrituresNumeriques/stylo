/* global print, Mongo */

const conn = Mongo()
const session = conn.startSession()
const db = conn.getDB('graphql')

session.startTransaction()

const cursor = db.passwords.find({})
while (cursor.hasNext()) {
  const password = cursor.next()
  const [ userId ] = password.users

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
}

session.commitTransaction()
