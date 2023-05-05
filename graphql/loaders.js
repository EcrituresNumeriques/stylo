const Tag = require('./models/tag')
const User = require('./models/user')
const Article = require('./models/article')
const Version = require('./models/version')
const DataLoader = require('dataloader')

async function getTags (tagIds) {
  return findByIds(tagIds, Tag)
}

async function getUsers (userIds) {
  return findByIds(userIds, User)
}

async function getArticles (articleIds) {
  return findByIds(articleIds, Article)
}

async function getVersions (versionIds) {
  return findByIds(versionIds, Version)
}

async function findByIds(ids, model) {
  const items = await model
    .find({ _id: { $in: ids } })
    .lean()
  const itemByIds = items.reduce((acc, item) => {
    acc[item._id] = item
    return acc
  }, {})
  // eslint-disable-next-line security/detect-object-injection
  return ids.map(id => itemByIds[id])
}

module.exports = {
  createTagLoader: () => new DataLoader(getTags),
  createUserLoader: () => new DataLoader(getUsers),
  createArticleLoader: () => new DataLoader(getArticles),
  createVersionLoader: () => new DataLoader(getVersions),
}
