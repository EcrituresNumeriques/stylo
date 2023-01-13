const conn = Mongo()
const session = conn.startSession()

session.startTransaction()

db.users.createIndex({ username: 1 }, { unique: true, sparse: true })

session.commitTransaction()
