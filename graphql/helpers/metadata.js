const YAML = require('js-yaml')
const { YAMLException } = require('js-yaml')
const removeMd = require('remove-markdown')
const { logger } = require('../logger')
const config = require('../config.js')

const canonicalBaseUrl = config.get('export.baseUrl')
const FORMATTED_FIELD_RE = /_f$/

/**
 * This sorting ensures the `nocite` key is always the last one.
 * @see https://github.com/EcrituresNumeriques/stylo/issues/425
 */
function sortKeys(a, b) {
  if (a === 'nocite') return 1
  if (b === 'nocite') return -1

  return a.localeCompare(b)
}

function walkObject(obj, itemTransformFn) {
  Object.entries(obj).forEach(([key, value]) => {
    itemTransformFn(obj, key, value)

    if (typeof value === 'object' && value !== null) {
      walkObject(value, itemTransformFn)
    }
  })

  return obj
}

/**
 * Parse a YAML into a useable object
 * It will throw a YAMLException if it fails to parse the string
 *
 * @param {String} yaml
 * @returns {Object}
 */
function toObject(yaml) {
  const [doc = {}] = YAML.loadAll(yaml, 'utf8')

  return doc
}

function reformat(yaml, { id, originalUrl, replaceBibliography = false }) {
  if (!yaml || yaml.trim().length === 0) {
    return ''
  }

  let doc = {}

  try {
    doc = toObject(yaml)
  } catch (error) {
    if (error instanceof YAMLException) {
      logger.warn(`Unable to parse Document YAML: ${yaml}. Ignoring`, error)
      return ''
    }
  }

  if (canonicalBaseUrl && originalUrl) {
    // add link-canonical to the first (and only) document
    doc['link-canonical'] = canonicalBaseUrl + originalUrl
  }

  if (replaceBibliography) {
    doc.bibliography = `${id}.bib`
  }

  if (doc.date) {
    const dateString = doc.date.replace(/\//g, '-')
    const [year, month, day] = dateString.split('-')
    doc.date = `${year}/${month}/${day}`
    doc.day = day
    doc.month = month
    doc.year = year
  }

  // add a default title if missing or empty
  if (!doc.title_f || doc.title_f.trim() === '') {
    doc.title_f = 'untitled'
  }

  walkObject(doc, (node, key, value) => {
    if (key.match(FORMATTED_FIELD_RE)) {
      const unsuffixedKey = key.replace(FORMATTED_FIELD_RE, '')
      const value_type = typeof value

      // we skip the replacement if the cleaned value is manually set
      if (unsuffixedKey in node) {
        return
      }

      if (Array.isArray(value)) {
        /* eslint-disable-next-line security/detect-object-injection */
        node[unsuffixedKey] = value.map(item => removeMd(item))
      } else if (value_type === 'string') {
        /* eslint-disable-next-line security/detect-object-injection */
        node[unsuffixedKey] = removeMd(value)
      } else {
        logger.warn(`node[%s] is of type %s. Cannot undo markdown. Skipping`, key, value_type)
      }
    }
  })

  if (Array.isArray(doc.keywords)) {
    doc.keywords = doc.keywords.map((obj, index) => {
      const { list_f } = obj
      const list_f_type = typeof list_f

      if (Array.isArray(list_f)) {
        obj.list_f = list_f.filter(d => d).map(item => item.trim()).join(', ')
        obj.list = list_f.filter(d => d).map(item => removeMd(item.trim())).join(', ')
      } else if (list_f_type === 'string') {
        obj.list = removeMd(list_f.trim())
      } else {
        logger.warn(`keywords[%d].list_f is of type %s. Cannot undo markdown. Skipping`, index, list_f_type)
      }

      return obj
    })
  }

  // dump the result enclosed in "---"
  return '---\n' + YAML.dump(doc, { sortKeys }) + '---'
}

/**
 * @param {{
 *   "type": string,
 *   "@version": string,
 *   "id": string,
 *   "publicationDate": string,
 *   "url": string,
 *   "lang": string,
 *   "title": string,
 *   "subtitle": string,
 *   "abstract": string,
 *   "keywords": string[],
 *   "license": string,
 *   "acknowledgements": string,
 *   localizedContent: {
 *     lang: string,
 *     title: string,
 *     subtitle: string,
 *     abstract: string,
 *     keywords: string[]
 *   }[],
 *   "controlledKeywords": {
 *     label: string,
 *     idRameau: string,
 *     uriRameau: string
 *   }[]
 *   "authors": [],
 *   "reviewers": [],
 *   "transcribers": [],
 *   "translators": [],
 *   "translationOf": {
 *     lang: string,
 *     title: string,
 *     url: string
 *   },
 *   "issue": {}
 *   "issueDirectors": [],
 *   "production": {
 *     issn: string,
 *     producer: string,
 *     prodNum: string,
 *     diffNum: string
 *   },
 *   "funder": {
 *     organization: string,
 *     id: string
 *   },
 *   "journal": {
 *     name: string,
 *     publisher: string,
 *     email: string,
 *     url: string
 *   },
 *   "journalDirectors": [],
 *   "senspublic": {"categories": string[]}
 * }} metadata
 * @returns {{
 *   id: string,
 *   acknowledgements: string,
 *   date: string,
 *   journal: string,
 *   journal_email: string,
 *   journal_issue: string,
 *   lang: string,
 *   "link-citations": string,
 *   nocite: string,
 *   prod: string,
 *   prodnum: string,
 *   diffnum: string,
 *   publisher: string,
 *   rights: string,
 *   subtitle_f: string,
 *   title_f: string,
 *   url_article: string
 *   issnnum: string,
 *   funder: {
 *     funder_id: string,
 *     funder_name: string,
 *   },
 *   abstract: [],
 *   articleslies: [],
 *   authors: [],
 *   controlledKeywords: [],
 *   director: [],
 *   dossier: [],
 *   issueDirectors: [],
 *   keywords: [],
 *   reviewers: [],
 *   transcribers: [],
 *   translatedTitle: [],
 *   translationOf: [],
 *   translations: [],
 *   translator: [],
 *   typeArticle: string[],
 * }}
 */
function toLegacyFormat(metadata) {
  // unmapped:
  // metadata.journal.url
  const abstract = [...metadata.localizedContent?.map(c => ({
    lang: c.lang,
    text_f: c.abstract
  })) ?? [], {
    lang: metadata.lang,
    text_f: metadata.abstract
  }]
  return {
    id: metadata.id,
    acknowledgements: metadata.acknowledgements,
    date: metadata.publicationDate,
    journal: metadata.journal?.name,
    journal_email: metadata.journal?.email,
    journal_issue: metadata.issue?.number,
    lang: metadata.lang,
    prod: metadata.production?.entities?.find(e => e.type === 'producer' && e.media !== "digital")?.name,
    prodnum: metadata.production?.entities?.find(e => e.type === 'producer' && e.media === "digital")?.name,
    diffnum: metadata.production?.entities?.find(e => e.type === 'publisher' && e.media === "digital")?.name,
    publisher: metadata.journal?.publisher,
    rights: metadata.license,
    subtitle_f: metadata.subtitle,
    title_f: metadata.title,
    url_article: metadata.url,
    issnnum: metadata.production?.issn,
    funder: {
      funder_id: metadata.funder?.id,
      funder_name: metadata.funder?.organization,
    },
    abstract: abstract,
    authors: metadata.authors,
    controlledKeywords: metadata.controlledKeywords,
    director: metadata.journalDirectors,
    dossier: [
      {
        id: metadata.issue?.identifier,
        title_f: metadata.issue?.title,
      }
    ],
    issueDirectors: metadata.issueDirectors,
    keywords: [
      {
        lang: metadata.lang,
        list_f: metadata.keywords,
      },
      ...metadata.localizedContent?.map(c => ({
        lang: c.lang,
        list_f: c.keywords
      })) ?? []
    ],
    reviewers: metadata.reviewers,
    transcribers: metadata.transcribers,
    translatedTitle: metadata.localizedContent?.map(c => ({
      lang: c.lang,
      text_f: c.title
    })),
    translationOf: [
      metadata.translationOf
    ],
    articleslies: [], // MISSING!
    translations: [], // MISSING!
    translator: metadata.translators,
    typeArticle: metadata.senspublic.categories
  }
}

/**
 * @param  {{
 *   id: string,
 *   acknowledgements: string,
 *   date: string,
 *   journal: string,
 *   journal_email: string,
 *   journal_issue: string,
 *   lang: string,
 *   "link-citations": string,
 *   nocite: string,
 *   prod: string,
 *   prodnum: string,
 *   diffnum: string,
 *   publisher: string,
 *   rights: string,
 *   subtitle_f: string,
 *   title_f: string,
 *   url_article: string
 *   issnnum: string,
 *   funder: {
 *     funder_id: string,
 *     funder_name: string,
 *   },
 *   abstract: [],
 *   articleslies: [],
 *   authors: [],
 *   controlledKeywords: [],
 *   director: [],
 *   dossier: [],
 *   issueDirectors: [],
 *   keywords: [],
 *   reviewers: [],
 *   transcribers: [],
 *   translatedTitle: [],
 *   translationOf: [],
 *   translations: [],
 *   translator: [],
 *   typeArticle: string[],
 * }} metadata
 * @returns {{
 *   "type": string,
 *   "@version": string,
 *   "id": string,
 *   "publicationDate": string,
 *   "url": string,
 *   "lang": string,
 *   "title": string,
 *   "subtitle": string,
 *   "abstract": string,
 *   "keywords": string[],
 *   "license": string,
 *   "acknowledgements": string,
 *   localizedContent: {
 *     lang: string,
 *     title: string,
 *     subtitle: string,
 *     abstract: string,
 *     keywords: string[]
 *   }[],
 *   "controlledKeywords": {
 *     label: string,
 *     idRameau: string,
 *     uriRameau: string
 *   }[]
 *   "authors": [],
 *   "reviewers": [],
 *   "transcribers": [],
 *   "translators": [],
 *   "translationOf": {
 *     lang: string,
 *     title: string,
 *     url: string
 *   },
 *   "issue": {}
 *   "issueDirectors": [],
 *   "production": {
 *     issn: string,
 *     entities: {type: string, media: string, name: string}[]
 *   },
 *   "funder": {
 *     organization: string,
 *     id: string
 *   },
 *   "journal": {
 *     name: string,
 *     publisher: string,
 *     email: string,
 *     url: string
 *   },
 *   "journalDirectors": [],
 * }}
 */
function fromLegacyFormat(metadata) {
  const translatedAbstract = metadata.abstract?.filter(a => a.lang !== metadata.lang)
  const translatedTitle = metadata.translatedTitle?.filter(a => a.lang !== metadata.lang)
  const translatedKeywords = metadata.keywords?.filter(a => a.lang !== metadata.lang)
  const languages = Array.from(new Set([...translatedAbstract?.map(a => a.lang) ?? [], ...translatedTitle?.map(t => t.lang) ?? [], ...translatedKeywords?.map(k => k.lang) ?? []]))
  const localizedContent = languages.map(l => ({
    lang: l,
    title: translatedTitle?.find(a => a.lang === l)?.text_f,
    abstract: translatedAbstract?.find(a => a.lang === l)?.text_f,
    keywords: translatedKeywords?.find(a => a.lang === l)?.list_f,
  }))
  const productionEntities = []
  if (metadata.prod) {
    productionEntities.push({
      type: "producer",
      media: "",
      name: metadata.prod
    })
  }
  if (metadata.prodnum) {
    productionEntities.push({
      type: "producer",
      media: "digital",
      name: metadata.prodnum
    })
  }
  if (metadata.diffnum) {
    productionEntities.push({
      type: "publisher",
      media: "digital",
      name: metadata.diffnum
    })
  }
  return {
    type: "article",
    "@version": "1.0",
    id: metadata.id,
    lang: metadata.lang,
    title: metadata.title_f,
    subtitle: metadata.subtitle_f,
    acknowledgements: metadata.acknowledgements,
    abstract: metadata.abstract.find(a => a.lang === metadata.lang)?.text_f,
    keywords: metadata.keywords.find(k => k.lang === metadata.lang)?.list_f,
    controlledKeywords: metadata.controlledKeywords,
    publicationDate: metadata.date,
    url: metadata.url_article,
    license: metadata.rights,
    authors: metadata.authors,
    reviewers: metadata.reviewers,
    transcribers: metadata.transcribers,
    translators: metadata.translator,
    issueDirectors: metadata.issueDirectors,
    journalDirectors: metadata.director,
    funder: {
      organization: metadata.funder?.funder_name,
      id: metadata.funder?.funder_id
    },
    journal: {
      name: metadata.journal,
      publisher: metadata.publisher,
      email: metadata.journal_email,
      url: undefined // value is not available in legacy format
    },
    issue: {
      title: metadata.dossier?.[0]?.title_f,
      identifier: metadata.dossier?.[0]?.id,
      number: metadata.journal_issue
    },
    production: {
      issn: metadata.issnnum,
      entities: productionEntities
    },
    localizedContent: localizedContent,
    senspublic: {
      categories: metadata.typeArticle
    }
  }
}

module.exports = {
  reformat,
  toObject,
  toLegacyFormat,
  fromLegacyFormat
}
