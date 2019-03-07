import React, {useState} from 'react'
import { connect } from "react-redux"
import styles from './sharecenter.module.scss'

import askGraphQL from '../helpers/graphQL'

import Modal from './Modal'
import Acquintances from './Acquintances'


const mapStateToProps = ({ logedIn, sessionToken, users }) => {
  return { logedIn, sessionToken, users }
}

const ConnectedShareCenter = (props) => {

  const [sharing,setSharing] = useState(false)
  const [shareType, setShareType] = useState()

  const fork = async () => {
    try{
      const query = `mutation($user:ID!,$article:ID!){sendArticle(article:$article,to:$user,user:$user){ _id }}`
      const variables = {user:props.users[0]._id,to:props.users[0]._id,article:props._id}
      await askGraphQL({query,variables}, 'forking Article',props.sessionToken)
      props.setNeedReload()
    }
    catch(err){
      alert(err)
    }
  }


  return (
    <>
      {sharing && <Modal cancel={()=>setSharing(false)}>
        <Acquintances {...props} action={shareType} cancel={()=>setSharing(false)}/>
      </Modal>}
      <div className={styles.reset} />
      <div className={styles.share}>
        <p onClick={()=>{setShareType('share');setSharing(true)}}>Share</p>
        <p onClick={()=>{setShareType('send');setSharing(true)}}>Send</p>
        <p onClick={async ()=>{await fork()}}>Fork</p>
      </div>
    </>
  )
}


const ShareCenter = connect(
  mapStateToProps
)(ConnectedShareCenter)

export default ShareCenter