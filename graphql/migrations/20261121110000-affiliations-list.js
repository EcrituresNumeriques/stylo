/**
 * Transforme la propriété "affiliations" des personnes (auteurs, relecteurs, traducteurs…)
 * d'une chaîne de caractères en une liste de chaînes de caractères.
 *
 * La chaîne n'est pas découpée car le séparateur n'est pas connu (virgule, point-virgule…) :
 * "Université de Montréal, Université Paris Cité" devient ["Université de Montréal, Université Paris Cité"].
 * Une chaîne vide est supprimée, comme le fait le formulaire de métadonnées.
 *
 * @param {unknown} value métadonnées (modifiées en place)
 * @returns {boolean} vrai si au moins une valeur a été modifiée
 */
function normalizeAffiliations(value) {
  let changed = false
  if (Array.isArray(value)) {
    for (const item of value) {
      changed = normalizeAffiliations(item) || changed
    }
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'affiliations' && typeof child === 'string') {
        if (child.trim() === '') {
          delete value.affiliations
        } else {
          value.affiliations = [child.trim()]
        }
        changed = true
      } else {
        changed = normalizeAffiliations(child) || changed
      }
    }
  }
  return changed
}

async function migrateCollection(mongo, collectionName, metadataPath) {
  const collection = mongo.collection(collectionName)
  const cursor = collection.find(
    { [metadataPath]: { $type: 'object' } },
    { projection: { [metadataPath]: 1 } }
  )
  let count = 0
  try {
    while (await cursor.hasNext()) {
      const document = await cursor.next()
      const metadata = metadataPath
        .split('.')
        .reduce((object, key) => object?.[key], document)
      if (normalizeAffiliations(metadata)) {
        await collection.updateOne(
          { _id: document._id },
          { $set: { [metadataPath]: metadata } },
          { upsert: false }
        )
        count++
      }
    }
  } catch (err) {
    console.log(`Something went wrong while processing ${collectionName}`, err)
    throw err
  } finally {
    await cursor.close()
  }
  console.log(`Affiliations converted to a list in ${count} ${collectionName}`)
}

exports.up = async function (db) {
  const mongo = db._getDbInstance()
  await migrateCollection(mongo, 'articles', 'workingVersion.metadata')
  await migrateCollection(mongo, 'versions', 'metadata')
  await migrateCollection(mongo, 'corpus', 'metadata')
}

exports.down = function () {
  return null
}

exports.normalizeAffiliations = normalizeAffiliations
