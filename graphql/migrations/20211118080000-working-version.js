exports.up = async function (db) {
  const articles = await db._find('articles', {})

  for await (const article of articles) {
    const latestVersionId = article.versions.slice(-1)[0]

    if (typeof article.workingVersion === 'undefined') {
      if (latestVersionId) {
        const [latestVersion] = await db._find('versions', { _id: latestVersionId })
        await db._run('update', 'articles', {
          query: { _id: article._id },
          update: {
            $set: {
              workingVersion: {
                bib: latestVersion.bib,
                md: latestVersion.md,
                yaml: latestVersion.yaml,
              },
            },
          },
          options: { upsert: false }
        })

        // if the latest version is "autosave", remove!
        await db.collections('versions').deleteOne({ _id: latestVersionId, autosave: true })
      }
    }
  }
}

exports.down = function () {
  return null
}
