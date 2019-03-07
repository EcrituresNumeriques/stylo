import React from 'react'
import { connect } from "react-redux"

import styles from './Articles.module.scss'
import askGraphQL from '../helpers/graphQL'

const mapStateToProps = ({ logedIn, sessionToken, users }) => {
  return { logedIn, sessionToken, users }
}


const ConnectedArticleDelete = (props) => {

  const deleteArticle = async () => {
    try{
      const query = `mutation($user:ID!,$article:ID!){deleteArticle(article:$article,user:$user){ _id }}`
      const variables = {user:props.users[0]._id,article:props._id}
      await askGraphQL({query,variables}, 'Deleting Article',props.sessionToken)
      props.setNeedReload()
    }
    catch(err){
      alert(err)
    }
  }

  return (
    <button className={styles.delete} onDoubleClick={()=>deleteArticle()}>Delete</button>
  )
}

const ArticleDelete = connect(
  mapStateToProps
)(ConnectedArticleDelete)

export default ArticleDelete