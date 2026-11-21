/**
 * Aggregation pipelines of the instance usage stats, one per file.
 *
 * Every computation happens in MongoDB: each pipeline returns the final shape
 * exposed by the GraphQL schema (`InstanceUsageStats`).
 * To keep them fast on large collections (articles and versions weigh gigabytes):
 * - documents are projected on the few fields needed, as early as possible;
 * - arrays are counted with `$size` rather than `$unwind`;
 * - no `$lookup` per document of a large collection (about 30 µs each):
 *   documents of another collection are added with `$unionWith`,
 *   then joined with a `$group` or a window.
 *
 * The pipelines are plain data: they can be pasted in mongosh to be measured
 * (`JSON.stringify` them).
 */
const activity = require('./activity.js')
const articles = require('./articles.js')
const { corpora, workspaces } = require('./collections.js')
const retention = require('./retention.js')
const users = require('./users.js')

module.exports = {
  users,
  articles,
  activity,
  retention,
  corpora,
  workspaces,
}
