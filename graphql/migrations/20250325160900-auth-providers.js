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
        $set: {
          'authProviders.zotero': {
            token: '$zoteroToken',
          },
        },
      },
    ],
  })
}

exports.down = function (db) {
  return db._run('updateMany', 'users', {
    query: {},
    update: {
      $unset: {
        authProviders: true,
      },
    },
  })
}
