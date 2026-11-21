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

module.exports = {
  fromLegacyFormat,
}
