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
      <h1 className={expand?null:styles.closed} onClick={()=>setExpand(!expand)}>{expand?"-":"+"} Bibliography</h1>
      {expand && <>
        {!props.readOnly && <button onClick={()=>setModal(true)}>Manage Bibliography</button>}
        {entries.map((ref)=>(<Reference key={`ref-${ref.cle}`} {...ref}/>))}
      </>}
      {modal && <Modal cancel={()=>setModal(false)}>
        <Bibliographe bib={props.bib} success={props.handleBib} cancel={()=>setModal(false)} article={props.article}/>
      </Modal>}
    </section>
  )
}
