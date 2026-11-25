/**
 * `users.connectedAt` is removed, replaced by `users.lastAccesses`
 * (the 10 most recent accesses, newest first: `{ at, ip, strategy }`).
 *
 * Whatever read `connectedAt` (usage statistics…) must now read `lastAccesses[0].at`.
 */
exports.up = async function (db) {
  if (db.internals.dryRun) return
  await db
    ._getDbInstance()
    .collection('users')
    .updateMany({ connectedAt: { $exists: true } }, [
      {
        $set: {
          lastAccesses: [{ at: '$connectedAt', ip: null, strategy: null }],
        },
      },
      { $unset: 'connectedAt' },
    ])
}

exports.down = function () {
  return null
}
