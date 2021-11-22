const conn = Mongo()
const db = conn.getDB('stylo-prod')

// @see https://mongoosejs.com/docs/transactions.html
db.transaction((session) => {
	  const cursor = db.articles.find({})
	  while (cursor.hasNext()) {
	    const article = cursor.next()
	    const title = article.title
	    const latestVersionId = article.versions.slice(-1)[0]
	    //print(`Processing article ${article._id}...`)
	    if (typeof article.workingVersion === 'undefined') {
	      if (latestVersionId) {
	        const latestVersion = db.versions.findOne({_id: latestVersionId})
	        db.articles.updateOne(
	          { _id: article._id },
	          { $set: { 'workingVersion': { bib: latestVersion.bib, md: latestVersion.md, yaml: latestVersion.yaml } } },
	          { upsert: false }
	        )
	        // if the latest version is "autosave", remove!
	        db.versions.remove(
	          { _id: latestVersionId, autosave: true }
	        )
	      } else {
	        print(`Article ${article._id} has no version and no workingVersion!`)
	      }
	    } else {
	      // article has already a workingVersion, skipping!
	    }
	  }
}
