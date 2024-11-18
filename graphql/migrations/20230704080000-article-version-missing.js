exports.up = async function (db) {
  const articles = await db._find('articles', {})

  for await (const article of articles) {
    const versionsIds = article.versions

    if (Array.isArray(versionsIds)) {
      for await (const _id of versionsIds) {
        const [version] = await db._find('versions', { _id })
        if (!version) {
          await db._run('update', 'articles', {
            query: { _id: article._id },
            update: { $pull: { versions: _id } }
          })
        }
      }
    }
  }
}

exports.down = function () {
  return null
}
