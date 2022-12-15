const conn = Mongo()
const session = conn.startSession()

session.startTransaction()

db.articles.createIndex({ 'updatedAt': -1 })
db.tags.createIndex({ 'name': -1 })
db.tags.createIndex({ 'createdAt': -1 })
db.versions.createIndex({ 'createdAt': -1 })

session.commitTransaction()
