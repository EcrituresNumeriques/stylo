import React,{useState} from 'react'

import styles from './bibliographe.module.scss'
import etv from '../../../helpers/eventTargetValue'
import bib2key from './CitationsFilter'

export default (props) => {
  const defaultSuccess = (result) => console.log(result)
  const success = props.success || defaultSuccess
  const [selector,setSelector] = useState('zotero')
  const [bib,setBib] = useState(props.bib)
  const [addCitation,setAddCitation] = useState('')

  const mergeCitations = ()=>{
    setBib(bib+'\n'+addCitation)
    setAddCitation('')
  }

  const removeCitation = (index) => {
    const nextArray = bib2key(bib)
    nextArray.splice(index,1)
    setBib(nextArray.map(b=>b.title).join('\n'))
  }

  return (
    <article>
      <h1 className={styles.title}>Bibliographe</h1>
      <nav className={styles.selector}>
        <p className={selector === "zotero"?styles.selected:null} onClick={()=>setSelector('zotero')}>Zotero</p>
        <p className={selector === "citations"?styles.selected:null} onClick={()=>setSelector('citations')}>Citations</p>
        <p className={selector === "raw"?styles.selected:null} onClick={()=>setSelector('raw')}>Raw bibtex</p>
      </nav>

      {selector === 'zotero' && <div className={styles.zotero}>
      <p>Please paste the URL of your zotero library, so that it looks like https://www.zotero.org/groups/<strong>IDnumber/name/items/collectionKey/collectionKey</strong></p>
      <label>https://www.zotero.org/groups/</label>
      <input type="text" placeholder="IDnumber/name/items/collectionKey/collectionKey"/>
      
      </div>}
      {selector === 'citations' && <div className={styles.citations}>
      <textarea value={addCitation} onChange={(e)=>setAddCitation(etv(e))} placeholder="Paste here the bibtext of the citation you want to add"/><button onClick={()=>mergeCitations()}>Add</button>
      {bib2key(bib).map((b,i)=><p key={`citation-${b.key}-${i}`} className={styles.citation}>@{b.key}<i onClick={()=>removeCitation(i)}>Remove</i></p>)}
      </div>}
      {selector === 'raw' && <div className={styles.raw}>
        <textarea value={bib} onChange={(e)=>setBib(etv(e))} />
      </div>}
      <button onClick={()=>{success(bib);props.cancel()}} className={styles.primary}>Save</button>

    </article>
  )
}