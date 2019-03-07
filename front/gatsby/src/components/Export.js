import React, {useState} from 'react'

import env from '../helpers/env'
import etv from '../helpers/eventTargetValue'

import styles from './export.module.scss'

const filterAlphaNum = (string) => {
  return string.replace(/\s/g,"_").replace(/[ÉéÈèÊêËë]/g,"e").replace(/[ÔôÖö]/g,"o").replace(/[ÂâÄäÀà]/g,"a").replace(/[Çç]/g,"c").replace(/[^A-Za-z0-9_]/g,"")  
}

export default props => {

  

  const [format, setFormat] = useState('html')
  const [csl,setCsl] = useState('chigagomodified')
  const [citation,setCitation] = useState('false')

  const startExport = () => {
    if(format === 'html' || format === 'zip'){
      window.open(`${env.EXPORT_ENDPOINT}/${format}${props.article?'Article':'Version'}/${props._id}?format=${csl}`)
    }
    else{
      window.open(`http://localhost:9090/cgi-bin/exportArticle/exec.cgi?id=${filterAlphaNum(props.title)}v${props.version}-${props.revision}&version=${props.versionId}&processor=xelatex&source=${env.EXPORT_ENDPOINT}/&format=${format}&bibstyle=${csl}&citation=${citation}`,'_blank');
    }
  }

  return(
    <section className={styles.export}>
      <h1>export</h1>
      <form>
        <select value={format} onChange={(e)=>setFormat(etv(e))}>
          <option value="html">HTML</option>
          <option value="zip">ZIP</option>
          <option value="pdf">PDF via Process</option>
          <option value="xml">XML (érudit) via Process</option>
          <option value="odt">ODT via Process</option>
          <option value="docx">DOCX via Process</option>
          <option value="html5">HTML5 via Process</option>
          <option value="epub">EPUB via Process</option>
          <option value="tei">TEI via Process</option>
        </select>
        <select value={csl} onChange={(e)=>setCsl(etv(e))}>
          <option value="chigagomodified">chigagomodified</option>
          <option value="lettres-et-sciences-humaines-fr">lettres-et-sciences-humaines-fr</option>
          <option value="chicago-fullnote-bibliography-fr">chicago-fullnote-bibliography-fr</option>
        </select>
        <select value={citation} onChange={(e)=>setCitation(etv(e))}>
          <option value={true}>Inline citation</option>
          <option value={false}>Regular citation</option>
        </select>
      </form>
      <nav>
        <p onClick={()=>startExport()}>Export</p>
      </nav>

    </section>
  )
}