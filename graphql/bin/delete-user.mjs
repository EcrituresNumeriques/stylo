#!/usr/bin/env node
import mongoose from 'mongoose'

import { parseArgs } from 'node:util'

import config from '../config.js'
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

const dbClient = await mongoose.connect(config.get('mongo.databaseUrl'), {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
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
  console.log('No user found with "%s".', email)
  await dbClient.disconnect()
  process.exit(0)
}

const [corpuses, tags, versions, workspaces] = await Promise.all([
  Corpus.findByUser(u),
  Tag.findByUser(u),
  Version.findByUser(u),
  Workspace.findByUser(u),
])

/*
 * Print summary
 */
if (values.force === false) {
  console.log({
    user: u,
    articles: u.articles.length,
    corpuses: corpuses.length,
    tags: tags.length,
    versions: versions.length,
    workspaces: workspaces.length,
  })
} else {
  console.log(await u.remove())
}

dbClient.disconnect()
