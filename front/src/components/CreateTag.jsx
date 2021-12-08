import React, { useState } from 'react'
import { connect } from 'react-redux'

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL'

import styles from './createTag.module.scss'
import Field from './Field'
import Button from './Button'
import { Check } from 'react-feather'

const mapStateToProps = ({ activeUser, sessionToken, applicationConfig }) => {
  return { activeUser, sessionToken, applicationConfig }
}

const ConnectedCreateTag = (props) => {
  const [articlesSelected, setArticlesSelected] = useState(
    props.articles.map((a) => ({ selected: false, _id: a._id, title: a.title }))
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const findAndUpdateArticle = (articles, id) => {
    const immutableArticles = JSON.parse(JSON.stringify(articles))
    const article = immutableArticles.find((a) => a._id === id)
    article.selected = !article.selected
    return immutableArticles
  }

  let baseQuery =
    'mutation($name:String!, $description:String, $user:ID!){ createTag(name:$name,description:$description,user:$user){ _id name } '
  let addToTag = articlesSelected
    .filter((a) => a.selected)
    .map(
      (a, i) =>
        `addToTag${i}: addToTag(article:"${a._id}",tag:"new",user:$user){ _id }`
    )
    .join(' ')
  const query = baseQuery + addToTag + '}'
  const variables = { user: props.activeUser._id, name, description }

  const createTag = async (event, cb, query, variables, token) => {
    try {
      event.preventDefault()
      await askGraphQL(
        { query, variables },
        'creating new tag',
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
          placeholder="Tag Name"
          autoFocus={true}
          className={styles.tagName}
          value={name}
          onChange={(e) => setName(etv(e))}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(etv(e))}
        />

        <ul className={styles.actions}>
          <li>
            <Button type="button" onClick={props.cancel}>Cancel</Button>
          </li>
          <li>
            <Button primary={true} type="submit" title="Create Article">
              <Check />
              Create Tag
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}

const CreateTag = connect(mapStateToProps)(ConnectedCreateTag)
export default CreateTag
