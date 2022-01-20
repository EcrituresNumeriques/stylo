/* global print, Mongo */

const conn = Mongo()
const session = conn.startSession()
const db = conn.getDB('graphql')

session.startTransaction()

const cursor = db.articles.find({})
while (cursor.hasNext()) {
  const article = cursor.next()
  const [ ownerId, ...contributors ] = article.owners

  db.articles.updateOne({ _id: article._id }, {
    $set: {
      owner: ownerId,
      contributors: contributors.map(userId => ({ user: userId, roles: ['read', 'write']}))
    }
  })
}

session.commitTransaction()
