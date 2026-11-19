#!/usr/bin/env node

/*
 * Manages opt-in features of users.
 *
 *   npm run features -- list
 *   npm run features -- show <email|id>
 *   npm run features -- enable <feature> <email|id>
 *   npm run features -- disable <feature> <email|id>
 *   npm run features -- users <feature>
 */

import { parseArgs } from 'node:util'
import mongoose from 'mongoose'

import config from '../config.js'
import { run } from '../helpers/featuresCommand.js'

config.validate({ allowed: 'strict' })

const { positionals } = parseArgs({ allowPositionals: true })

const dbClient = await mongoose.connect(config.get('mongo.databaseUrl'))

try {
  console.info(await run(positionals))
} finally {
  await dbClient.disconnect()
}
