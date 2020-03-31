import React, {useState} from "react"
import { connect } from "react-redux"
import askGraphQL from '../helpers/graphQL';
import etv from '../helpers/eventTargetValue'

import Bouton from './Bouton'
import * as Icon from 'react-feather';


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
  const [edit,setEdit] = useState(false)
  const [tempName,setTempName] = useState(props.t.name)
  const [tempDescription, setTempDescription] = useState(props.t.description)
  const [tempColor,setTempColor] = useState(props.t.color)

  const deleteTag = async (id) => {
    console.log("hello destroy tag "+id)
    const query = `mutation($user:ID!,$tag:ID!){deleteTag(user:$user,tag:$tag){ _id }}`
    const variables = {user:props.activeUser._id,tag:props.t._id}
    await askGraphQL({query,variables},"Deleting tag", props.sessionToken)
    props.setNeedReload()
  }

  const saveTag = async () => {
    console.log("hello update tag")
    const query = `mutation($user:ID!,$tag:ID!,$color:String!,$name:String!,$description:String!){updateTag(user:$user,tag:$tag,name:$name,description:$description,color:$color){ _id name description color }}`
    const variables = {user:props.activeUser._id,tag:props.t._id, name: tempName, description: tempDescription, color: tempColor}
    await askGraphQL({query,variables},"update tag", props.sessionToken)
    props.setNeedReload()
    setEdit(false)
  }

  const cancelEdit = () => {
    setTempColor(props.t.color)
    setTempName(props.t.name)
    setTempDescription(props.t.description)
    setEdit(false)
  }


  return (
    <div className={props.t.selected?props.styles.selectedTags:props.styles.tags} key={`tagy-${props.t._id}`}>
      {!edit && <section className={props.styles.reader}>
      <p onClick={()=>setExpanded(!expanded)}>{expanded?"-":"+"}</p>
      <p onClick={()=>props.setTags(findAndUpdateTag(props.tags,props.t._id))}>{props.t.name}</p>
      {expanded && <p>{props.t.description}</p>}
      {expanded && <nav className={props.styles.action}>
        
        <Bouton title="Edit" onClick={()=>setEdit(true)}>
          <Icon.Edit3/>
        </Bouton>
        <div className={props.styles.spacer}></div>
        <Bouton title="Delete" onClick={()=>deleteTag(props.t._id)}>
          <Icon.Trash/>
        </Bouton>
            
      </nav>}
      </section>}
      {edit && <section className={props.styles.writer}>

        <form className={props.styles.editTag}>
          <input type="text" value={tempName} onChange={e=>setTempName(etv(e))}/>
          <textarea value={tempDescription}  onChange={e=>setTempDescription(etv(e))}/>
          <input type="text" value={tempColor}  onChange={e=>setTempColor(etv(e))}/>

        </form>

        <nav className={props.styles.action}> 
          <Bouton title="Validate" onClick={()=>saveTag()}>
            <Icon.Save/>
          </Bouton>
          <div className={props.styles.spacer}>
            </div>
          <Bouton title="Cancel" onClick={()=>cancelEdit()}>
            <Icon.X/>
          </Bouton>
              
        </nav>
      </section>}
    </div>
  )
})