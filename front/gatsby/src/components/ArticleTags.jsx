import React from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'

import Tag from './Tag'

const mapStateToProps = ({ activeUser, sessionToken, applicationConfig }) => {
  return { activeUser, sessionToken, applicationConfig }
}

const ConnectedArticleTags = (props) => {
  const addToTags = async ({ name, _id, color }) => {
    props.setTags([...props.stateTags, { _id, name, color, selected: true }])
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
        props.sessionToken,
        props.applicationConfig
      )
    } catch (err) {
      alert(err)
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
        props.sessionToken,
        props.applicationConfig
      )
    } catch (err) {
      alert(err)
    }
  }

  return (
    <ul>
      {props.stateTags.map((t) => (
        <li
          onClick={() => rmFromTags(t._id)}
          key={`article-${props._id}-${t._id}`}
        >
          <Tag data={t}
               name={`articleTag-${t._id}`}
               onClick={() => rmFromTags(t._id)}
          />
        </li>
      ))}

      {props.masterTags
        .filter((t) => !props.stateTags.map((u) => u._id).includes(t._id))
        .map((t) => (
          <li
            key={`article-${props._id}-${t._id}`}
          >
            <Tag data={t}
                 name={`articleTag-${t._id}`}
                 onClick={() => addToTags({ _id: t._id, name: t.name, color: t.color })}
            />
          </li>
        ))}
    </ul>
  )
}

const ArticleTags = connect(mapStateToProps)(ConnectedArticleTags)
export default ArticleTags
