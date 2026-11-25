const {
  EXAMPLE_ARTICLE_DELAY_IN_MS,
  ONE_DAY_IN_MS,
  ONE_MINUTE_IN_MS,
  ONE_YEAR_AGO,
  bands,
  count,
  distributionOf,
  fromSnapshot,
  isFilled,
  isNonEmptyArray,
  isNonEmptyString,
  onlyWhen,
  snapshotFacet,
  unionWithUsers,
} = require('./expressions.js')

const METADATA = '$workingVersion.metadata'
const BIBLIOGRAPHY = '$workingVersion.bib'

// metadata fields set by Stylo itself (the title is the one of the article)
const AUTOMATIC_METADATA_FIELDS = [
  'type',
  '@version',
  'link-citations',
  'nocite',
  'title',
]
// values of a new article: a field still holding one is not counted as filled
const DEFAULT_METADATA_VALUES = {
  lang: 'fr',
  license:
    'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
}

// [band, from (included), to (excluded)], in milliseconds
const WRITING_DURATIONS = [
  ['underAMinute', null, ONE_MINUTE_IN_MS],
  ['underAnHour', ONE_MINUTE_IN_MS, 60 * ONE_MINUTE_IN_MS],
  ['underADay', 60 * ONE_MINUTE_IN_MS, ONE_DAY_IN_MS],
  ['underAMonth', ONE_DAY_IN_MS, 30 * ONE_DAY_IN_MS],
  ['underAYear', 30 * ONE_DAY_IN_MS, 365 * ONE_DAY_IN_MS],
  ['moreThanAYear', 365 * ONE_DAY_IN_MS, null],
]
// [band, from (included), to (excluded)], in filled metadata fields
const METADATA_LEVELS = [
  ['none', null, 1],
  ['few', 1, 5],
  ['several', 5, 10],
  ['many', 10, null],
]

/**
 * Fields of each article. Reading `workingVersion` is the costly part of the scan.
 */
const perArticle = {
  owner: 1,
  createdAt: 1,
  // time between the creation and the last update
  writingMs: { $subtract: ['$updatedAt', '$createdAt'] },
  shared: { $gt: [{ $size: { $ifNull: ['$contributors', []] } }, 0] },
  // the author and the contributors
  collaborators: {
    $size: {
      $setUnion: [['$owner'], { $ifNull: ['$contributors.user', []] }],
    },
  },
  withZotero: isNonEmptyString('$zoteroLink'),
  tags: { $size: { $ifNull: ['$tags', []] } },
  // BibTeX entries: lines starting with `@`
  // (splitting is much faster than $regexFindAll on large bibliographies)
  bibliographyEntries: {
    $cond: [
      { $eq: [{ $type: BIBLIOGRAPHY }, 'string'] },
      // a line break is put before the first entry (once the leading blanks are removed)
      {
        $subtract: [
          {
            $size: {
              $split: [
                { $concat: ['\n', { $ltrim: { input: BIBLIOGRAPHY } }] },
                '\n@',
              ],
            },
          },
          1,
        ],
      },
      0,
    ],
  },
  // the metadata always has every field: only filled ones are counted
  withMetadata: {
    $or: [
      isNonEmptyArray(`${METADATA}.authors`),
      isNonEmptyString(`${METADATA}.abstract`),
      isNonEmptyArray(`${METADATA}.keywords`),
      isNonEmptyString(`${METADATA}.keywords`),
    ],
  },
  // filled fields of the metadata, whatever the type of document:
  // the automatic fields and the default values are first replaced by null,
  // once per article (cheaper than filtering each field)
  metadataFields: {
    $size: {
      $filter: {
        input: {
          $objectToArray: {
            $mergeObjects: [
              { $ifNull: [METADATA, {}] },
              {
                $literal: Object.fromEntries(
                  AUTOMATIC_METADATA_FIELDS.map((field) => [field, null])
                ),
              },
              ...Object.entries(DEFAULT_METADATA_VALUES).map(
                ([field, value]) => ({
                  $cond: [
                    { $eq: [`${METADATA}.${field}`, value] },
                    { $literal: { [field]: null } },
                    {},
                  ],
                })
              ),
            ],
          },
        },
        as: 'field',
        cond: isFilled('$$field.v', 3),
      },
    },
  },
}

/**
 * The example article is the first article of an account, created along with it.
 * The signup date comes with the users, joined by owner with a window.
 * An example article never modified is not counted at all.
 */
const flagExampleArticles = [
  unionWithUsers({ owner: '$_id', signedUpAt: '$createdAt' }),
  {
    $setWindowFields: {
      partitionBy: '$owner',
      output: {
        signedUpAt: { $max: '$signedUpAt' },
        firstCreatedAt: { $min: '$createdAt' },
      },
    },
  },
  { $match: { article: true } },
  {
    $set: {
      isExample: {
        $and: [
          { $eq: [{ $type: '$createdAt' }, 'date'] },
          { $eq: [{ $type: '$signedUpAt' }, 'date'] },
          { $eq: ['$createdAt', '$firstCreatedAt'] },
          {
            $lte: [
              { $abs: { $subtract: ['$createdAt', '$signedUpAt'] } },
              EXAMPLE_ARTICLE_DELAY_IN_MS,
            ],
          },
        ],
      },
    },
  },
  {
    $match: {
      $expr: {
        $or: [
          { $not: ['$isExample'] },
          { $gt: ['$writingMs', ONE_MINUTE_IN_MS] },
        ],
      },
    },
  },
]

const hasBibliography = { $gt: ['$bibliographyEntries', 0] }

/**
 * Statistics over the articles, the example articles excluded.
 */
const SNAPSHOT = [
  count('total'),
  count('createdLastTwelveMonths', { $gte: ['$createdAt', ONE_YEAR_AGO] }),
  count('shared', '$shared'),
  count('withBibliography', hasBibliography),
  count('withMetadata', '$withMetadata'),
  count('bibliographiesFromZotero', { $and: [hasBibliography, '$withZotero'] }),
  bands('metadataLevels', '$metadataFields', METADATA_LEVELS),
  bands('writingDurations', '$writingMs', WRITING_DURATIONS),
  distributionOf('tags', onlyWhen({ $gt: ['$tags', 0] }, '$tags')),
  distributionOf(
    'bibliographyEntries',
    onlyWhen(hasBibliography, '$bibliographyEntries')
  ),
  distributionOf('collaborators', onlyWhen('$shared', '$collaborators')),
]

/**
 * Collection: articles.
 * Shared articles, their content (bibliography, metadata, tags) and writing duration.
 * The example article created with each account is not counted.
 */
module.exports = [
  { $project: { article: { $literal: true }, ...perArticle } },
  ...flagExampleArticles,
  {
    $facet: {
      snapshot: [{ $match: { isExample: false } }, ...snapshotFacet(SNAPSHOT)],
    },
  },
  { $project: fromSnapshot('snapshot', SNAPSHOT) },
]
