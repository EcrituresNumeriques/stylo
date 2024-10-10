/* global print, Mongo */

const conn = Mongo()
const session = conn.startSession()

session.startTransaction()

// 1. remove article owners (moved into owner+contributors)
db.articles.updateMany({}, { $unset: { owners: ''}})

// 2. remove linked collections relations
db.users.updateMany({}, { $unset: { tokens: '', passwords: '' }})

// 3. remove Password related stuff
db.passwords.dropIndexes()
db.passwords.drop()

// 4. remove Token related stuff
db.tokens.dropIndexes()
db.tokens.drop()

session.commitTransaction()
