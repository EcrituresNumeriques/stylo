import React, {useState} from "react"
import { connect } from "react-redux"
import askGraphQL from '../helpers/graphQL';


const mapStateToProps = ({ logedIn, activeUser, sessionToken }) => {
  return { logedIn, activeUser, sessionToken }
}

const findAndUpdateTag = (tags,id)=> {
  console.log("test")
  const immutableTags = JSON.parse(JSON.stringify(tags))
  const tag = immutableTags.find(t => t._id === id)
  tag.selected = !tag.selected
  return immutableTags
}


export default connect(mapStateToProps)((props) => {
  
  const [expanded,setExpanded] = useState(false)
  const deleteTag = async (id) => {
    console.log("hello destroy tag "+id)
    const query = `mutation($user:ID!,$tag:ID!){deleteTag(user:$user,tag:$tag){ _id }}`
    const variables = {user:props.activeUser._id,tag:props.t._id}
    await askGraphQL({query,variables},"Deleting tag", props.sessionToken)
    props.setNeedReload()
  }


  return (
    <div className={props.t.selected?props.styles.selectedTags:props.styles.tags} key={`tagy-${props.t._id}`}>
      <p onClick={()=>setExpanded(!expanded)}>{expanded?"-":"+"}</p>
      <p onClick={()=>props.setTags(findAndUpdateTag(props.tags,props.t._id))}>{props.t.name}</p>
      {expanded && <p>{props.t.description}</p>}
      {expanded && <p>color : {props.t.color}</p>}
      {expanded && <button onDoubleClick={()=>deleteTag(props.t._id)}>Delete {props.t.name}</button>}
    </div>
  )
})