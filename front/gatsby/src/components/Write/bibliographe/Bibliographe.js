import React,{useState} from 'react'

import styles from './bibliographe.module.scss'
import etv from '../../../helpers/eventTargetValue'
import bib2key from './CitationsFilter'

export default (props) => {
  const defaultSuccess = (result) => console.log(result)
  const success = props.success || defaultSuccess
  const [selector,setSelector] = useState('zotero')
  const [bib,setBib] = useState(props.bib)

  return (
    <article>
      <h1>Bibliographe</h1>
      <nav className={styles.selector}>
        <p className={selector === "zotero"?styles.selected:null} onClick={()=>setSelector('zotero')}>Zotero</p>
        <p className={selector === "citations"?styles.selected:null} onClick={()=>setSelector('citations')}>Citations</p>
        <p className={selector === "raw"?styles.selected:null} onClick={()=>setSelector('raw')}>Raw bibtex</p>
      </nav>

      {selector === 'zotero' && <p>TBD: Configure Zotero</p>}
      {selector === 'citations' && <p>{JSON.stringify(bib2key(bib))}</p>}
      {selector === 'raw' && <div className={styles.raw}>
        <textarea value={bib} onChange={(e)=>setBib(etv(e))} />
      </div>}
      <button onClick={()=>{success(bib);props.cancel()}}>Save</button>

    </article>
  )
}