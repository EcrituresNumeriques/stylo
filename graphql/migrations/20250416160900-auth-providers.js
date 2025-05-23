exports.up = async function (db) {
  await db._run('updateMany', 'users', {
    query: { authType: 'oidc' },
    update: [
      {
        $set: {
          'authProviders.humanid': {
            email: '$email',
          },
        },
      },
    ],
  })

  await db._run('updateMany', 'users', {
    query: { zoteroToken: { $type: 'string' } },
    update: [
      {
        // we unset tokens rather than migrating them
        // as we miss the 'userId' and thus are unable to authenticate/link an account
        $unset: 'zoteroToken',
      },
    ],
  })
}

exports.down = function (db) {
  return db._run('updateMany', 'users', {
    query: {},
    update: [
      {
        $unset: 'authProviders',
      },
    ],
  })
}
