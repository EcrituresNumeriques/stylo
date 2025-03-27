const Tag = require('./models/tag')
const User = require('./models/user')
const Article = require('./models/article')
const Version = require('./models/version')
const DataLoader = require('dataloader')

/**
 * @typedef {Object} Loaders
 * @property {DataLoader} tags
 * @property {DataLoader} users
 * @property {DataLoader} articles
 * @property {DataLoader} versions
 */

async function getTags(tagIds) {
  return findByIds(tagIds, Tag)
}

async function getUsers(userIds) {
  return findByIds(userIds, User)
}

async function getArticles(articleIds) {
  return findByIds(articleIds, Article)
}

async function getVersions(versionIds) {
  return findByIds(versionIds, Version)
}

async function findByIds(ids, model) {
  const items = await model.find({ _id: { $in: ids } }).lean()
  const itemByIds = items.reduce((acc, item) => {
    acc[item._id] = item
    return acc
  }, {})
  // eslint-disable-next-line security/detect-object-injection
  return ids.map((id) => itemByIds[id])
}

module.exports = {
  createLoaders() {
    return {
      tags: new DataLoader(getTags),
      users: new DataLoader(getUsers),
      articles: new DataLoader(getArticles),
      versions: new DataLoader(getVersions),
    }
  },
}
