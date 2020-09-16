import React, {useState} from 'react'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';
import etv from '../helpers/eventTargetValue'


const mapStateToProps = ({ activeUser, sessionToken }) => {
    return { activeUser, sessionToken }
}

const ConnectedChapter = props => {

  const [renaming,setRenaming] = useState(false)
  const [title,setTitle] = useState(props.title)
  const [tempTitle,setTempTitle] = useState(props.title)

  const rename = async (e) => {
    e.preventDefault();
    const query = `mutation($article:ID!,$title:String!,$user:ID!){renameArticle(article:$article,title:$title,user:$user){title}}`
    const variables = {user:props.activeUser._id,article:props._id,title:tempTitle}
    await askGraphQL({query,variables},'Renaming Article',props.sessionToken)
    setTitle(tempTitle)
    setRenaming(false)
    props.setNeedReload();
  }

  return(
    <>
    {!renaming && <p>{title} ({props.versions[0].version}.{props.versions[0].revision} {props.versions[0].message})<span onClick={()=>setRenaming(true)}>(rename)</span></p>}
    {renaming && renaming && <form onSubmit={e=>rename(e)}>
            <input value={tempTitle} onChange={(e)=>setTempTitle(etv(e))} /><input type="submit" value="Rename"/><span onClick={()=>setRenaming(false)}>(cancel)</span>

        </form>}
    </>
  )
}


const Chapter = connect(
  mapStateToProps
)(ConnectedChapter)
export default Chapter