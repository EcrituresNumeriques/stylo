const Article = require('../models/article.js')
const User = require('../models/user.js')

// incorrect, because we also inject it at runtime, based on Git tag
const { version } = require('../package.json')

module.exports = {
  Query: {
    async stats() {
      return {
        version,
      }
    },
  },

  InstanceUsageStats: {
    async articles() {
      const [total, years] = await Promise.all([
        Article.estimatedDocumentCount(),
        Article.aggregate([
          { $project: { createdYear: { $year: '$createdAt' } } },
          { $group: { _id: '$createdYear', count: { $sum: 1 } } },
        ]),
      ])

      return {
        total,
        years: years.map(({ _id: year, count }) => ({ year, count })),
      }
    },

    async users() {
      // a user can authenticate both with a password and with an OpenID Connect provider:
      // it is then counted in both
      const [total, local, openid, years] = await Promise.all([
        User.estimatedDocumentCount(),
        // authentication with a password
        User.countDocuments({ password: { $type: 'string', $ne: '' } }),
        // authentication with an OpenID Connect provider (Huma-Num HumanID)
        User.countDocuments({
          $or: [
            { 'authProviders.humanid.id': { $nin: [null, ''] } },
            { 'authProviders.humanid.email': { $nin: [null, ''] } },
          ],
        }),
        User.aggregate([
          { $project: { createdYear: { $year: '$createdAt' } } },
          { $group: { _id: '$createdYear', count: { $sum: 1 } } },
        ]),
      ])

      return {
        total,
        local,
        openid,
        years: years.map(({ _id: year, count }) => ({ year, count })),
      }
    },
  },
}
