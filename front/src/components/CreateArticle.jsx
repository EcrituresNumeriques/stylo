import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Check } from 'react-feather'

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL'

import styles from './createArticle.module.scss'
import Button from './Button'
import Field from './Field'
import Tag from './Tag'

const mapStateToProps = ({ sessionToken, applicationConfig }) => {
  return { sessionToken, applicationConfig }
}

const ConnectedCreateArticle = (props) => {
  const [title, setTitle] = useState('')
  const [tagsSelected, setTagsSelected] = useState(
    props.tags.map((t) => Object.assign(t, { selected: false }))
  )

  const findAndUpdateTag = (tags, id) => {
    const immutableTags = structuredClone(tags)
    const tag = immutableTags.find((t) => t._id === id)
    tag.selected = !tag.selected
    return immutableTags
  }

  const baseQuery = 'mutation($title:String!, $user:ID!){ createArticle(title:$title,user:$user){ _id title }'
  const addToTag = tagsSelected
    .filter((t) => t.selected)
    .map(
      (t, i) =>
        `addToTag${i}: addToTag(article:"new",tag:"${t._id}",user:$user){ _id }`
    )
    .join(' ')
  const query = baseQuery + addToTag + '}'
  const variables = { user: props.currentUser._id, title }

  const createTag = async (event, cb, query, variables, token) => {
    try {
      event.preventDefault()
      await askGraphQL(
        { query, variables },
        'creating new Article',
        token,
        props.applicationConfig
      )
      cb()
    } catch (err) {
      alert(err)
    }
  }

  return (
    <section className={styles.create}>
      <form
        onSubmit={(event) => {
          createTag(
            event,
            props.triggerReload,
            query,
            variables,
            props.sessionToken
          )
        }}
      >
        <Field
          type="text"
          placeholder="Article title"
          value={title}
          autoFocus={true}
          className={styles.articleTitle}
          onChange={(e) => setTitle(etv(e))}
        />

        <fieldset className={styles.fieldset}>
          <legend>Select tags</legend>
          <ul className={styles.tags}>
            {tagsSelected.map((t) => (
              <li key={`selectTag-${t._id}`}>
                <Tag
                  tag={t}
                  activeUser={props.currentUser}
                  name={`selectTag-${t._id}`}
                  onClick={() =>
                    setTagsSelected(findAndUpdateTag(tagsSelected, t._id))
                  }
                />
              </li>
            ))}
          </ul>
        </fieldset>
        <ul className={styles.actions}>
          <li>
            <Button type="button" onClick={props.cancel}>Cancel</Button>
          </li>
          <li>
            <Button primary={true} type="submit" title="Create Article">
              <Check />
              Create this article
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}

const CreateArticle = connect(mapStateToProps)(ConnectedCreateArticle)
export default CreateArticle
