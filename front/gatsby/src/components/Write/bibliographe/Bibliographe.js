import React,{useState} from 'react'
import { connect } from 'react-redux'

import styles from './bibliographe.module.scss'
import etv from '../../../helpers/eventTargetValue'
import bib2key from './CitationsFilter'
import askGraphQL from '../../../helpers/graphQL';

const mapStateToProps = ({ logedIn, sessionToken, users }) => {
  return { logedIn, sessionToken, users  }
}

const ConnectedBibliographe = (props) => {
  const defaultSuccess = (result) => console.log(result)
  const success = props.success || defaultSuccess
  const [selector,setSelector] = useState('zotero')
  const [bib,setBib] = useState(props.bib)
  const [addCitation,setAddCitation] = useState('')
  const [zoteroLink,setZoteroLink] = useState(props.article.zoteroLink || "")


  const mergeCitations = ()=>{
    setBib(bib+'\n'+addCitation)
    setAddCitation('')
  }

  const removeCitation = (index) => {
    const nextArray = bib2key(bib)
    nextArray.splice(index,1)
    setBib(nextArray.map(b=>b.title).join('\n'))
  }

  const saveNewZotero = async () => {
    //saveOnGraphQL
    if(props.article.zoteroLink !== zoteroLink){
      console.log("saving to graphQL",props.article.zoteroLink, zoteroLink,props.sessionToken)
      try{
        const query =`mutation($user:ID!,$article:ID!,$zotero:String!){zoteroArticle(article:$article,zotero:$zotero,user:$user){ _id zoteroLink}}`
        const variables = {zotero:zoteroLink,user:props.users[0]._id,article:props.article._id}
        await askGraphQL({query,variables},"updating zoteroLink",props.sessionToken)
      }
      catch(err){
        alert(err)
      }
    }
    //FetchZotero
    fetch('https://api.zotero.org/groups/'+zoteroLink+'/items/?v=3&format=bibtex',{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.text()
    })
    .then(function(bib){
      setBib(bib)
      success(bib)
      props.cancel()
    });
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
      <p>Please paste the URL of your zotero library, so that it looks like https://www.zotero.org/groups/<strong>[IDnumber]/collections/[IDcollection]</strong></p>
      <label>https://www.zotero.org/groups/</label>
      <input type="text" placeholder="IDnumber/name/items/collectionKey/collectionKey" value={zoteroLink} onChange={e=>setZoteroLink(etv(e))}/>
      <button onClick={()=>saveNewZotero()}>Save zotero link and fetch</button>

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

const Bibliographe = connect(
  mapStateToProps
)(ConnectedBibliographe)

export default Bibliographe