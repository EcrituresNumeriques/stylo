exports.up = async function (db) {
  await db._run('updateMany', 'corpus', {
    query: { type: { '$exists': true } },
    update: [
      {
        $set: {
          'type': 'neutral',
        },
      },
    ],
  })
}

exports.down = function (db) {
  return db._run('updateMany', 'corpus', {
    query: {},
    update: [
      {
        $unset: 'type',
      },
    ],
  })
}
