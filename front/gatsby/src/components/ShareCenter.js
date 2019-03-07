import React, {useState} from 'react'
import styles from './sharecenter.module.scss'

import Modal from './Modal'
import Acquintances from './Acquintances'

const ShareCenter = (props) => {

  const [sharing,setSharing] = useState(false)
  const [shareType, setShareType] = useState()

  return (
    <>
      {sharing && <Modal cancel={()=>setSharing(false)}>
        <Acquintances {...props} action={shareType} cancel={()=>setSharing(false)}/>
      </Modal>}
      <div className={styles.reset} />
      <div className={styles.share}>
        <p onClick={()=>{setShareType('share');setSharing(true)}}>Share</p>
        <p onClick={()=>{setShareType('send');setSharing(true)}}>Send</p>
        <p onClick={()=>{setShareType('fork');setSharing(true)}}>Fork</p>
      </div>
    </>
  )
}

export default ShareCenter