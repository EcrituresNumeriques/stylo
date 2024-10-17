exports.up = async function (db) {
  const articles = await db._find('articles', {})

  for await (const article of articles) {
    const [ ownerId, ...contributors ] = article.owners ?? [article.owner]

    await db._run('update', 'articles', {
      query: { _id: article._id },
      update: {
        $set: {
          owner: ownerId,
          contributors: contributors.map(userId => ({ user: userId, roles: ['read', 'write']}))
        }
      }
    })
  }
}

exports.down = async function () {
  return null
}
