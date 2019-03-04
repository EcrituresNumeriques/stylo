import React, {useState} from 'react'


import styles from '../write.module.scss'
import Modal from '../Modal'
import Bibliographe from './bibliographe/Bibliographe'
import bib2key from './bibliographe/CitationsFilter'

export default (props) => {
  let entries = bib2key(props.bib)

  const [expand,setExpand] = useState(true)
  const [modal, setModal] = useState(false)

  return (
    
    <section>
      <h1 className={expand?null:styles.closed} onDoubleClick={()=>setExpand(!expand)}>Bibliography</h1>
      {expand && <>
        {entries.map((ref)=>(<p key={`ref-${ref.key}`} data-clipboard-text={"[@"+ref.key+"]"} button-title={ref.title}><span>@{ref.key}</span></p>))}
        {!props.readOnly && <button className={styles.secondary} onClick={()=>setModal(true)}>Manage Bibliography</button>}
      </>}
      {modal && <Modal cancel={()=>setModal(false)}>
        <Bibliographe bib={props.bib} success={props.handleBib} cancel={()=>setModal(false)}/>
      </Modal>}
    </section>
  )
}