import React from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'
import styles from './Articles.module.scss'

const mapStateToProps = ({ activeUser, sessionToken }) => {
  return { activeUser, sessionToken }
}

const ConnectedArticleTags = (props) => {
  const addToTags = async ({ name, _id, color }) => {
    props.setTags([...props.stateTags, { _id, name, color }])
    try {
      const query = `mutation($article:ID!,$tag:ID!,$user:ID!){addToTag(article:$article,tag:$tag,user:$user){ _id }}`
      const variables = {
        article: props._id,
        tag: _id,
        user: props.activeUser._id,
      }
      await askGraphQL(
        { query, variables },
        'adding to tag',
        props.sessionToken
      )
    } catch (err) {
      props.needReload()
    }
  }

  const rmFromTags = async (id) => {
    props.setTags(props.stateTags.filter((t) => t._id !== id))
    try {
      const query = `mutation($article:ID!,$tag:ID!,$user:ID!){removeFromTag(article:$article,tag:$tag,user:$user){ _id }}`
      const variables = {
        article: props._id,
        tag: id,
        user: props.activeUser._id,
      }
      await askGraphQL(
        { query, variables },
        'removing from tag',
        props.sessionToken
      )
    } catch (err) {
      props.needReload()
    }
  }

  return (
    <>
      {!props.editTags &&
        props.stateTags.map((t) => (
          <li key={`article-${props._id}-${t._id}`}>{t.name}</li>
        ))}
      {props.editTags &&
        props.stateTags.map((t) => (
          <li
            className={styles.clickMeOff}
            onClick={() => rmFromTags(t._id)}
            key={`article-${props._id}-${t._id}`}
          >
            {t.name} [X]
          </li>
        ))}
      {props.editTags &&
        props.masterTags
          .filter((t) => !props.stateTags.map((u) => u._id).includes(t._id))
          .map((t) => (
            <li
              className={styles.clickMeOn}
              onClick={() =>
                addToTags({ _id: t._id, name: t.name, color: t.color })
              }
              key={`article-${props._id}-${t._id}`}
            >
              {t.name} [ ]
            </li>
          ))}
    </>
  )
}

const ArticleTags = connect(mapStateToProps)(ConnectedArticleTags)

export default ArticleTags
