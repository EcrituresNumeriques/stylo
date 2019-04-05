import React, {useState} from 'react'

import Modal from '../Modal'
import Reference from './Reference'
import Bibliographe from './bibliographe/Bibliographe'
import bib2key from './bibliographe/CitationsFilter'

import styles from './biblio.module.scss'

export default (props) => {
  let entries = bib2key(props.bib)
  const [expand,setExpand] = useState(true)
  const [modal, setModal] = useState(false)

  return (
    
    <section id={styles.section}>
      <h1 className={expand?null:styles.closed} onDoubleClick={()=>setExpand(!expand)}>Bibliography</h1>
      {expand && <>
        {entries.map((ref)=>(<Reference key={`ref-${ref.cle}`} {...ref}/>))}
        {!props.readOnly && <button className={styles.secondary} onClick={()=>setModal(true)}>Manage Bibliography</button>}
      </>}
      {modal && <Modal cancel={()=>setModal(false)}>
        <Bibliographe bib={props.bib} success={props.handleBib} cancel={()=>setModal(false)} article={props.article}/>
      </Modal>}
    </section>
  )
}