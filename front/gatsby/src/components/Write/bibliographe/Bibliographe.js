import React, {useRef, useState, useEffect} from 'react'
import {connect} from 'react-redux'
import env from '../../../helpers/env'

import styles from './bibliographe.module.scss'
import etv from '../../../helpers/eventTargetValue'
import bib2key from './CitationsFilter'
import askGraphQL from '../../../helpers/graphQL';
import {fetchBibliographyFromGroupSuffix, fetchBibliographyFromCollectionId, fetchUserCollections} from '../../../helpers/zotero'
import {toBibtex, validate} from '../../../helpers/bibtex'
import ReferenceTypeIcon from '../../ReferenceTypeIcon.js'

const mapStateToProps = ({ logedIn, sessionToken, activeUser }) => {
  return { logedIn, sessionToken, activeUser  }
}

const mapDispatchToProps = dispatch => ({
  refreshProfile: () => dispatch({ type: 'REFRESH_PROFILE' })
})

const ConnectedBibliographe = (props) => {
  const defaultSuccess = (result) => console.log(result)
  const {refreshProfile} = props
  const success = props.success || defaultSuccess
  const [selector, setSelector] = useState('zotero')
  const [isSaving, setSaving] = useState(false)
  const [bib, setBib] = useState(props.bib)
  const [addCitation, setAddCitation] = useState('')
  const [isCitationValid, setCitationValid] = useState(false)
  const [isRawBibtexValid, setRawBibtexValid] = useState(false)
  const [zoteroLink, setZoteroLink] = useState(props.article.zoteroLink || "")
  const [zoteroCollectionId, setZoteroCollectionId] = useState(null)
  const {zoteroToken} = props.activeUser
  const [zoteroCollections, setZoteroCollections] = useState([])
  const citationForm = useRef()

  useEffect(() => {
    if (zoteroToken) {
      setSaving(true)
      fetchUserCollections({ token: zoteroToken })
        .then(setZoteroCollections)
        .finally(() => setSaving(false))
    }
  }, [zoteroToken])

  const citations = bib2key(bib)

  const mergeCitations = () => {
    setBib(bib + '\n' + addCitation)
    citationForm.current.reset()
  }

  const validateCitation = (bibtex, stateHook, next) => {
    next(bibtex)

    validate(bibtex).then(result => {
      if (result.warnings.length || result.errors.length) {
        stateHook(false)
        console.error(result.warnings.join('\n') + result.errors.join('\n'))
      }
      else {
        stateHook(result.empty || result.success !== 0)
      }
    })
  }

  const removeCitation = (citations, indexToRemove) => {
    const filteredEntries = citations
      .filter((entry, index) => index !== indexToRemove)
      .map(({ entry }) => entry)

    const bibtex = toBibtex(filteredEntries)

    // we reform the bibtex output based on what we were able to parse
    setBib(bibtex)
  }

  const saveNewZotero = async () => {
    setSaving(true)

    // saveOnGraphQL
    if (props.article.zoteroLink !== zoteroLink) {
      console.log("saving to graphQL", props.article.zoteroLink, zoteroLink)
      try {
        const query =`mutation($user:ID!,$article:ID!,$zotero:String!){zoteroArticle(article:$article,zotero:$zotero,user:$user){ _id zoteroLink}}`
        const variables = { zotero: zoteroLink, user: props.activeUser._id, article: props.article._id }
        await askGraphQL({ query,variables }, "updating zoteroLink", props.sessionToken)
      }
      catch (err) {
        setSaving(false)
        alert(err)
      }
    }

    // we synchronize the collection, any time we save
    if (zoteroLink) {
      await fetchBibliographyFromGroupSuffix(zoteroLink).then(result => {
        setSaving(false)
        const bib = result.join('\n')
        setBib(bib)
        success(bib)
        props.cancel()
      })
    }
    else {
      // previous value was empty, and we tried to save an empty value again
      setSaving(false)
    }
  }

  const importCollection = ({ token, collectionId }) => {
    setSaving(true)
    fetchBibliographyFromCollectionId({ token, collectionId}).then(result => {
        setSaving(false)
        const bib = result.join('\n')
        setBib(bib)
        success(bib)
        props.cancel()
      })
  }

  return (
    <article>
      <h1 className={styles.title}>Bibliography</h1>
      <nav className={styles.selector}>
        <p className={selector === "zotero"?styles.selected:null} onClick={()=>setSelector('zotero')}>Zotero</p>
        <p className={selector === "citations"?styles.selected:null} onClick={()=>setSelector('citations')}>Citations</p>
        <p className={selector === "raw"?styles.selected:null} onClick={()=>setSelector('raw')}>Raw BibTeX</p>
      </nav>

      {selector === 'zotero' && <div className={styles.zotero}>
        <form onSubmit={(e) => e.preventDefault() && saveNewZotero()}>
          <p>Please paste the URL of your Zotero library, so that it looks like https://www.zotero.org/groups/<strong>[IDnumber]/collections/[IDcollection]</strong></p>
          <label>https://www.zotero.org/groups/</label>
          <input type="text" placeholder="[IDnumber]/collections/[IDcollection]" value={zoteroLink} onChange={e=>setZoteroLink(etv(e))}/>
          <button type="submit" onClick={() => saveNewZotero()} disabled={isSaving || (!zoteroLink && zoteroLink === props.article.zoteroLink)}>{isSaving ? 'Saving…' : 'Save Zotero link and fetch'}</button>
        </form>
        <hr />
        <form disabled={isSaving} onSubmit={(e) => e.preventDefault()}>
          <select onChange={(event) => setZoteroCollectionId(etv(event))}>
            <option value="">{isSaving ? 'Fetching collections…' : 'Pick a collection'}</option>
            {zoteroCollections.map(({ data }) => <option key={data.key} value={data.key}>{data.name}</option>)}
          </select>

          {zoteroToken && <button type="submit" disabled={!zoteroCollectionId || isSaving} onClick={() => importCollection({ token: zoteroToken, collectionId: zoteroCollectionId })}>Import this private collection</button>}
          {!zoteroToken && <button type="button" onClick={() => {
            const popup = window.open(`${env.BACKEND_ENDPOINT}/login/zotero`, 'openid', 'width=320&height=640&menubar=0&toolbar=0')
            popup.addEventListener('message', (event) => { 
              console.log(`Received message: ${event.data}`)
              refreshProfile()
              popup.close()
            })
          }
          }>Connect my Zotero account</button>}
        </form>
      </div>}

      {selector === 'citations' && <form ref={citationForm} onSubmit={(e) => e.preventDefault() && mergeCitations()} className={styles.citations}>
        <textarea onChange={event => validateCitation(etv(event), setCitationValid, setAddCitation)} placeholder="Paste here the BibTeX of the citation you want to add"/>

        <button type="submit" disabled={isCitationValid !== true} onClick={() => mergeCitations()}>Add</button>

        <p>{citations.length} citations.</p>

        <div className={styles.responsiveTable}>
          <table className={styles.citationList}>
            <colgroup>
              <col className={styles.colIcon} />
              <col className={styles.colKey} />
              <col className={styles.colActions} />
            </colgroup>
            <tbody>
              {citations.map((b, i)=> <tr key={`citation-${b.key}-${i}`} className={styles.citation}>
                <td className={`icon-${b.type} ${styles.colIcon}`}>
                  <ReferenceTypeIcon type={b.type} />
                </td>
                <th className={styles.colKey} scope="row">@{b.key}</th>
                <td className={styles.colActions}><button onClick={()=>removeCitation(citations, i)}>Remove</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <button onClick={()=>{success(bib); props.cancel()}} className={styles.primary}>Save</button>
      </form>}

      {selector === 'raw' && <form onSubmit={(e) => e.preventDefault()}>
        <div className={styles.raw}>
          <textarea defaultValue={bib} onChange={event => validateCitation(etv(event), setRawBibtexValid, setBib)} />
        </div>
        <button disabled={isRawBibtexValid !== true} onClick={()=>{success(bib); props.cancel()}} className={styles.primary}>Save</button>
      </form>}

    </article>
  )
}

const Bibliographe = connect(
  mapStateToProps, mapDispatchToProps
)(ConnectedBibliographe)

export default Bibliographe
