import React, { useState } from 'react'
import { connect } from 'react-redux'

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL'

import styles from './Articles.module.scss'

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
        <input
          type="text"
          placeholder="Tag Name"
          value={name}
          onChange={(e) => setName(etv(e))}
        />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(etv(e))}
        />
        <ul>
          <li>Add articles to tag =></li>
          {articlesSelected.map((a) => (
            <li
              key={`selectArticle-${a._id}`}
              className={a.selected ? styles.selected : styles.unselected}
              onClick={() =>
                setArticlesSelected(
                  findAndUpdateArticle(articlesSelected, a._id)
                )
              }
            >
              {a.title}
            </li>
          ))}
        </ul>
        <input type="submit" value="Create Tag" />
      </form>
    </section>
  )
}

const CreateTag = connect(mapStateToProps)(ConnectedCreateTag)
export default CreateTag
