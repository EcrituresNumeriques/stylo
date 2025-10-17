import { merge } from 'allof-merge'

import blogPostSchema from './article-blog-post-metadata.schema.json'
import blogPostUiSchema from './article-blog-post-ui-schema.json'
import meetingNotesSchema from './article-meeting-notes-metadata.schema.json'
import meetingNotesUiSchema from './article-meeting-notes-ui-schema.json'
import defaultSchema from './article-metadata.schema.json'
import defaultUiSchema from './article-ui-schema.json'

const defaultSchemaMerged = merge(defaultSchema)
const blogPostSchemaMerged = merge(blogPostSchema)
const meetingNotesSchemaMerged = merge(meetingNotesSchema)

export const ArticleSchemas = [
  {
    name: 'default',
    data: defaultSchemaMerged,
    const: getConstMetadata(defaultSchemaMerged),
    ui: defaultUiSchema,
  },
  {
    name: 'blog-post',
    data: blogPostSchemaMerged,
    const: getConstMetadata(blogPostSchemaMerged),
    ui: blogPostUiSchema,
  },
  {
    name: 'meeting-notes',
    data: meetingNotesSchemaMerged,
    const: getConstMetadata(meetingNotesSchemaMerged),
    ui: meetingNotesUiSchema,
  },
]

function getConstMetadata(schema) {
  const props = schema.properties
  return Object.entries(props)
    .filter(([, value]) => value.const !== undefined)
    .reduce(function (map, [key, val]) {
      map[key] = val.const
      return map
    }, {})
}

export function clean(obj) {
  const clone = structuredClone(obj)
  removeEmptyArray(clone)
  removeEmptyObject(clone)
  return clone
}

export function removeEmptyArray(obj) {
  Object.keys(obj).forEach((key) => {
    const prop = obj[key]
    if (Array.isArray(prop) && prop.length === 0) delete obj[key]
    if (typeof prop === 'object' && prop !== null) {
      removeEmptyArray(prop)
    }
  })
}

export function removeEmptyObject(obj) {
  Object.keys(obj).forEach((key) => {
    const prop = obj[key]
    if (typeof prop === 'object' && prop !== null) {
      if (Object.keys(prop).length === 0) {
        delete obj[key]
      } else {
        removeEmptyObject(prop)
      }
    }
  })
}
