exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const users = mongo.collection('users')
  await users.updateMany(
    { authType: 'oidc' },
    {
      $set: {
        'authProviders.humanid': {
          email: '$email',
        },
      },
    }
  )

  await users.updateMany(
    { zoteroToken: { $type: 'string' } },
    {
      // we unset tokens rather than migrating them
      // as we miss the 'userId' and thus are unable to authenticate/link an account
      $set: { zoteroToken: '' },
    }
  )
}

exports.down = async function (db) {
  const mongo = db._getDbInstance()
  const users = mongo.collection('users')
  await users.updateMany(
    {},
    {
      $unset: {
        authProviders: '',
      },
    }
  )
}
