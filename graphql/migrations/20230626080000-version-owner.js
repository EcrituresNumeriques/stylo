exports.up = async function (db) {
  const versions = await db._find('versions', {"owner": null })

  for await (const version of versions) {
    const articleId = version.article
    const articles = await db._find('articles', { _id: articleId })

    for await (const article of articles) {
      if (article.owner !== null) {
        await db._run('update', 'versions', {
          query: { _id: version._id },
          update: {
            $set: {
              owner: article.owner,
            },
          },
          options: { upsert: false }
        })
      }
    }
  }
}

exports.down = function () {
  return null
}
