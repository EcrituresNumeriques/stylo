
const Article = require('../models/article.js')
const User = require('../models/user.js')

// incorrect, because we also inject it at runtime, based on Git tag
const { version } = require('../package.json')

module.exports = {
  Query: {
    async stats () {
      return {
        version
      }
    }
  },

  InstanceUsageStats: {
    async articles () {
      const [total, years] = await Promise.all([
        Article.estimatedDocumentCount(),
        Article.aggregate([
          { $project: { createdYear: {$year: "$createdAt"} }  },
          { $group: { _id: '$createdYear', count: {$sum: 1} } }
        ])
      ])

      return {
        total,
        years: years.map(({ _id: year, count }) => ({ year, count }))
      }
    },

    async users () {
      const [total, [{count: local}], [{count: openid}], years] = await Promise.all([
        User.estimatedDocumentCount(),
        User.aggregate([
          { $match:{ authType: "local"} },
          { $count: 'count'}
        ]),
        User.aggregate([
          { $match:{ authType: { $ne : "local" }} },
          { $count: 'count'}
        ]),
        User.aggregate([
          { $project: { createdYear: {$year: "$createdAt"} }  },
          { $group: { _id: '$createdYear', count: {$sum: 1} } }
        ])
      ])

      return {
        total,
        local,
        openid,
        years: years.map(({ _id: year, count }) => ({ year, count }))
      }
    }
  }
}
