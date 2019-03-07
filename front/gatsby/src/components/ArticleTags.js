import React from 'react'
import { connect } from "react-redux"


import askGraphQL from '../helpers/graphQL';


const mapStateToProps = ({ logedIn, users, sessionToken }) => {
  return { logedIn, users, sessionToken }
}


const ConnectedArticleTags = (props) => {

  const addToTags = async ({name,_id}) => {
    props.setTags([...props.stateTags,{_id,name}])
  }

  const rmFromTags = async (id) => {
    props.setTags(props.stateTags.filter(t=>t._id !== id))
  }

  return (
    <>
      <p>{JSON.stringify(props.stateTags)}</p>
      <p>{JSON.stringify(props.masterTags)}</p>
      {!props.editTags && props.tags.map(t=>
        <li key={`article-${props._id}-${t._id}`}>{t.name}</li>
      )}
      {props.editTags && props.stateTags.map(t=>
        <li onClick={()=>rmFromTags(t._id)} key={`article-${props._id}-${t._id}`}>{t.name} [X]</li>
      )}
      {props.editTags && props.masterTags.filter(t => !props.stateTags.map(u=>u._id).includes(t._id)).map(t=>
        <li onClick={()=>addToTags({_id:t._id,name:t.name})} key={`article-${props._id}-${t._id}`}>{t.name} [ ]</li>
      )}
    </>
  )
}

const ArticleTags = connect(
  mapStateToProps
)(ConnectedArticleTags)

export default ArticleTags