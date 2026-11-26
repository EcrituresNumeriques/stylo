/**
 * Renseigne le `username` des comptes qui n'en ont pas avec leur identifiant
 * HumanID, pour qu'ils puissent être désignés dans les feature flags.
 *
 * Un identifiant déjà utilisé comme `username` par un autre compte, y compris à
 * la casse près (`gflorent` et `Gflorent`), est ignoré : il s'agit en général
 * d'un doublon de la même personne.
 *
 * @param {import('mongodb').Collection} users
 * @returns {Promise<{ updated: number, skipped: { _id: unknown, username: string }[] }>}
 */
async function copyHumanIdToUsername(users) {
  const cursor = users.find(
    {
      deletedAt: null,
      username: { $in: [null, ''] },
      'authProviders.humanid.id': { $type: 'string', $ne: '' },
    },
    { projection: { 'authProviders.humanid.id': 1 } }
  )
  let updated = 0
  const skipped = []
  try {
    for await (const { _id, authProviders } of cursor) {
      const username = authProviders.humanid.id
      const taken = await users.findOne(
        { _id: { $ne: _id }, username },
        { collation: { locale: 'en', strength: 2 }, projection: { _id: 1 } }
      )
      if (taken) {
        skipped.push({ _id, username })
        continue
      }
      try {
        await users.updateOne({ _id }, { $set: { username } })
        updated++
      } catch (error) {
        if (error.code !== 11000) throw error
        skipped.push({ _id, username })
      }
    }
  } finally {
    await cursor.close()
  }
  return { updated, skipped }
}

exports.up = async function (db) {
  if (db.internals.dryRun) return
  const { updated, skipped } = await copyHumanIdToUsername(
    db._getDbInstance().collection('users')
  )
  console.log(`HumanID identifier copied to the username of ${updated} users`)
  for (const { _id, username } of skipped) {
    console.log(`Username ${username} already taken, user ${_id} skipped`)
  }
}

exports.down = function () {
  return null
}

exports.copyHumanIdToUsername = copyHumanIdToUsername
