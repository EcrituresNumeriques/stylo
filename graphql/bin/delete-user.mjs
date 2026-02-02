#!/usr/bin/env node
import mongoose from 'mongoose'

import { parseArgs } from 'node:util'

import config from '../config.js'
import Article from '../models/article.js'
import Corpus from '../models/corpus.js'
import Tag from '../models/tag.js'
import User from '../models/user.js'
import Version from '../models/version.js'
import Workspace from '../models/workspace.js'

config.validate({ allowed: 'strict' })

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    force: { type: 'boolean', default: false, short: 'f' },
  },
})

const [email] = positionals

if (!email) {
  throw RangeError('email argument is missing.')
}

const dbClient = await mongoose.connect(config.get('mongo.databaseUrl'), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const u = await User.findOne(
  {
    email,
  },
  {
    _id: true,
    displayName: true,
    articles: true,
    connectedAt: true,
  }
)

/*
 * No user found?
 */
if (!u) {
  throw new Error(`No user found with "${email}"`)
}

const [corpuses, tags, versions, workspaces, articlesCount] = await Promise.all(
  [
    Corpus.findByUser({ user: u }),
    Tag.findByUser(u),
    Version.findByUser(u),
    Workspace.findByUser(u),
    Article.countDocuments({ owner: u._id }),
  ]
)

/*
 * Print summary
 */
console.info([
  {
    user: u,
    articles: articlesCount,
    corpuses: corpuses.length,
    tags: tags.length,
    versions: versions.length,
    workspaces: workspaces.length,
  },
])

if (values.force) {
  await u.softDelete()
  console.info('Deleted!')
}

dbClient.disconnect()
