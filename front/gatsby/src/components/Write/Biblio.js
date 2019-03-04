import React, {useState} from 'react'


import styles from '../write.module.scss'
import Modal from '../Modal'
import Bibliographe from './bibliographe/Bibliographe'


export default (props) => {

  const compare = (a,b) => {
    if (a.key < b.key)
      return -1;
    if (a.key > b.key)
      return 1;
    return 0;
  }

  const bib = props.bib || "";

    // TODO Understand why we need a spacer for book to be understood
    const itemsAllowed = [
      "@spacer",
      "@book",
      "@article",
      "@incollection",
      "@phdthesis",
      "@misc",
      "@inproceedings",
      "@techreport",
      "@unpublished",
    ]
    const regex = new RegExp('/(?='+itemsAllowed.join(')|(?=')+')/g')

    let entries = [];
    entries = bib.split(regex)
      .filter((ref)=>(ref.match(/^@/g)))
      .map((ref)=>(ref.replace(/^\s+|\s+$/g, '')))
      .map((ref)=>({title:ref,key:ref.match(/^@.+{(.+),/)[1]}))
      .sort(compare);

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
        <Bibliographe />
      </Modal>}
    </section>
  )
}