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
 * Parse a YAML into a usable object
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
        node[unsuffixedKey] = value
          .filter((item) => typeof item === 'string')
          .map((item) => removeMd(item))
      } else if (value_type === 'string') {
        /* eslint-disable-next-line security/detect-object-injection */
        node[unsuffixedKey] = removeMd(value)
      } else {
        logger.warn(
          `node[%s] is of type %s. Cannot undo markdown. Skipping`,
          key,
          value_type
        )
      }
    }
  })

  if (Array.isArray(doc.keywords)) {
    doc.keywords = doc.keywords.map((obj, index) => {
      const { list_f } = obj
      const list_f_type = typeof list_f

      if (Array.isArray(list_f)) {
        obj.list_f = list_f
          .filter((d) => d && typeof d === 'string')
          .map((item) => item.trim())
          .join(', ')
        obj.list = list_f
          .filter((d) => d && typeof d === 'string')
          .map((item) => removeMd(item.trim()))
          .join(', ')
      } else if (list_f_type === 'string') {
        obj.list = removeMd(list_f.trim())
      } else {
        logger.warn(
          `keywords[%d].list_f is of type %s. Cannot undo markdown. Skipping`,
          index,
          list_f_type
        )
      }

      return obj
    })
  }

  // dump the result enclosed in "---"
  // forcing quotes is better for pandoc
  // @see https://github.com/EcrituresNumeriques/stylo/issues/1249
  return (
    '---\n' +
    YAML.dump(doc, {
      sortKeys,
      noArrayIndent: true,
      forceQuotes: true,
      quotingType: '"',
    }) +
    '---\n'
  )
}

/**
 * @param {{
 *   'type': string,
 *   '@version': string,
 *   'id': string,
 *   'publicationDate': string,
 *   'url': string,
 *   'lang': string,
 *   'title': string,
 *   'subtitle': string,
 *   'abstract': string,
 *   'keywords': string[],
 *   'license': string,
 *   'acknowledgements': string,
 *   localizedContent: {
 *     lang: string,
 *     title: string,
 *     subtitle: string,
 *     abstract: string,
 *     keywords: string[]
 *   }[],
 *   'controlledKeywords': {
 *     label: string,
 *     idRameau: string,
 *     uriRameau: string
 *   }[]
 *   'authors': [],
 *   'reviewers': [],
 *   'transcribers': [],
 *   'translators': [],
 *   'translationOf': {
 *     lang: string,
 *     title: string,
 *     url: string
 *   },
 *   'issue': {}
 *   'issueDirectors': [],
 *   'production': {
 *     issn: string,
 *     entities: []
 *   },
 *   'funder': {
 *     organization: string,
 *     id: string
 *   },
 *   'journal': {
 *     name: string,
 *     publisher: string,
 *     email: string,
 *     url: string
 *   },
 *   'journalDirectors': [],
 *   'senspublic': {'categories': string[], 'linkedArticles': any, 'translations': any}
 * }} metadata
 * @returns {{
 *   id: string,
 *   acknowledgements: string,
 *   date: string,
 *   journal: string,
 *   journal_email: string,
 *   journal_issue: string,
 *   lang: string,
 *   'link-citations': string,
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
  const {
    id,
    abstract: mainAbstract,
    acknowledgements,
    localizedContent,
    publicationDate,
    journal,
    issue,
    lang,
    production,
    license,
    subtitle,
    title,
    url,
    funder,
    authors,
    controlledKeywords,
    journalDirectors,
    issueDirectors,
    keywords,
    reviewers,
    transcribers,
    translationOf,
    translators,
    senspublic,
    ...extra
  } = metadata
  const abstract = [
    ...(localizedContent?.map((c) => ({
      lang: c.lang,
      text_f: c.abstract,
    })) ?? []),
    {
      lang: lang,
      text_f: mainAbstract,
    },
  ]
  return {
    ...extra,
    id,
    acknowledgements,
    date: publicationDate,
    journal: journal?.name,
    journal_email: journal?.email,
    journal_issue: issue?.number,
    lang: lang,
    prod: production?.entities?.find(
      (e) => e.type === 'producer' && e.media !== 'digital'
    )?.name,
    prodnum: production?.entities?.find(
      (e) => e.type === 'producer' && e.media === 'digital'
    )?.name,
    diffnum: production?.entities?.find(
      (e) => e.type === 'publisher' && e.media === 'digital'
    )?.name,
    publisher: journal?.publisher,
    rights: license,
    subtitle_f: subtitle,
    title_f: title,
    url_article: url,
    issnnum: production?.issn,
    funder: {
      funder_id: funder?.id,
      funder_name: funder?.organization,
    },
    abstract: abstract,
    authors: authors?.map((p) => toLegacyPerson(p)),
    controlledKeywords: controlledKeywords,
    director: journalDirectors?.map((p) => toLegacyPerson(p)),
    dossier: [
      {
        id: issue?.identifier,
        title_f: issue?.title,
      },
    ],
    issueDirectors: issueDirectors?.map((p) => toLegacyPerson(p)),
    keywords: [
      {
        lang: lang,
        list_f: keywords,
      },
      ...(localizedContent?.map((c) => ({
        lang: c.lang,
        list_f: c.keywords,
      })) ?? []),
    ],
    reviewers: reviewers?.map((p) => toLegacyPerson(p)),
    transcribers: transcribers?.map((p) => toLegacyPerson(p)),
    translatedTitle: localizedContent?.map((c) => ({
      lang: c.lang,
      text_f: c.title,
    })),
    translationOf: [translationOf],
    articleslies: senspublic?.linkedArticles,
    translations: senspublic?.translations,
    translator: translators?.map((p) => toLegacyPerson(p)),
    typeArticle: senspublic?.categories,
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
 *   'link-citations': string,
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
 *   'type': string,
 *   '@version': string,
 *   'id': string,
 *   'publicationDate': string,
 *   'url': string,
 *   'lang': string,
 *   'title': string,
 *   'subtitle': string,
 *   'abstract': string,
 *   'keywords': string[],
 *   'license': string,
 *   'acknowledgements': string,
 *   localizedContent: {
 *     lang: string,
 *     title: string,
 *     subtitle: string,
 *     abstract: string,
 *     keywords: string[]
 *   }[],
 *   'controlledKeywords': {
 *     label: string,
 *     idRameau: string,
 *     uriRameau: string
 *   }[]
 *   'authors': [],
 *   'reviewers': [],
 *   'transcribers': [],
 *   'translators': [],
 *   'translationOf': {
 *     lang: string,
 *     title: string,
 *     url: string
 *   },
 *   'issue': {}
 *   'issueDirectors': [],
 *   'production': {
 *     issn: string,
 *     entities: {type: string, media: string, name: string}[]
 *   },
 *   'funder': {
 *     organization: string,
 *     id: string
 *   },
 *   'journal': {
 *     name: string,
 *     publisher: string,
 *     email: string,
 *     url: string
 *   },
 *   'journalDirectors': [],
 * }}
 */
function fromLegacyFormat(metadata) {
  const {
    id,
    lang,
    title_f,
    subtitle_f,
    acknowledgements,
    abstract,
    keywords,
    translatedTitle,
    controlledKeywords,
    date,
    url_article,
    rights,
    authors,
    reviewers,
    transcribers,
    translator,
    issueDirectors,
    director,
    funder,
    journal,
    publisher,
    journal_email,
    dossier,
    journal_issue,
    issnnum,
    prod,
    prodnum,
    diffnum,
    typeArticle,
    articleslies,
    translations,
    ...extra
  } = metadata
  const abstractNormalized =
    typeof abstract === 'string' ? [{ lang: 'fr', text_f: abstract }] : abstract
  const translatedAbstracts = abstractNormalized?.filter(
    (a) => a?.lang !== lang
  )
  const translatedTitles = translatedTitle?.filter((a) => a?.lang !== lang)
  const translatedKeywords = keywords?.filter((a) => a?.lang !== lang)
  const languages = Array.from(
    new Set([
      ...(translatedAbstracts?.map((a) => a?.lang) ?? []),
      ...(translatedTitles?.map((t) => t?.lang) ?? []),
      ...(translatedKeywords?.map((k) => k?.lang) ?? []),
    ])
  )
  const localizedContent = languages.map((l) => ({
    lang: l,
    title: translatedTitles?.find((a) => a?.lang === l)?.text_f,
    abstract: translatedAbstracts?.find((a) => a?.lang === l)?.text_f,
    keywords: translatedKeywords?.find((a) => a?.lang === l)?.list_f,
  }))
  const productionEntities = []
  if (prod) {
    productionEntities.push({
      type: 'producer',
      media: '',
      name: prod,
    })
  }
  if (prodnum) {
    productionEntities.push({
      type: 'producer',
      media: 'digital',
      name: prodnum,
    })
  }
  if (diffnum) {
    productionEntities.push({
      type: 'publisher',
      media: 'digital',
      name: diffnum,
    })
  }

  return {
    ...extra,
    type: 'article',
    '@version': '1.0',
    id,
    lang,
    title: title_f,
    subtitle: subtitle_f,
    acknowledgements,
    abstract: abstractNormalized?.find((a) => a?.lang === lang)?.text_f,
    keywords: keywords?.find((k) => k?.lang === lang)?.list_f,
    controlledKeywords: controlledKeywords,
    publicationDate: date,
    url: url_article,
    license: rights,
    authors: authors?.map((p) => fromLegacyPerson(p)),
    reviewers: reviewers?.map((p) => fromLegacyPerson(p)),
    transcribers: transcribers?.map((p) => fromLegacyPerson(p)),
    translators: translator?.map((p) => fromLegacyPerson(p)),
    issueDirectors: issueDirectors?.map((p) => fromLegacyPerson(p)),
    journalDirectors: director?.map((p) => fromLegacyPerson(p)),
    funder: {
      organization: funder?.funder_name,
      id: funder?.funder_id,
    },
    journal: {
      name: journal,
      publisher: publisher,
      email: journal_email,
      url: undefined, // value is not available in legacy format
    },
    issue: {
      title: dossier?.[0]?.title_f,
      identifier: dossier?.[0]?.id,
      number: journal_issue,
    },
    production: {
      issn: issnnum,
      entities: productionEntities,
    },
    localizedContent: localizedContent,
    senspublic: {
      categories: typeArticle,
      linkedArticles: articleslies,
      translations: translations,
    },
  }
}

function fromLegacyPerson(p) {
  if (p) {
    const { forname, ...rest } = p
    return {
      forename: forname,
      ...rest,
    }
  }
  return p
}

function toLegacyPerson(p) {
  if (p) {
    const { forename, ...rest } = p
    return {
      forname: forename,
      ...rest,
    }
  }
  return p
}

module.exports = {
  reformat,
  toObject,
  toLegacyFormat,
  fromLegacyFormat,
}
