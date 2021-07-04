import React, { useState } from 'react'
import { connect } from 'react-redux'

import Select from './Select'
import styles from './export.module.scss'

function filterAlphaNum (string) {
  return string
    .replace(/\s/g, '_')
    .replace(/[ÉéÈèÊêËë]/g, 'e')
    .replace(/[ÔôÖö]/g, 'o')
    .replace(/[ÂâÄäÀà]/g, 'a')
    .replace(/[Çç]/g, 'c')
    .replace(/[^A-Za-z0-9_]/g, '')
}

const mapStateToProps = ({ applicationConfig }) => {
  return { applicationConfig }
}

const Export = ({ book, bookId, name, title, version, revision, versionId, applicationConfig }) => {
  const { processEndpoint, exportEndpoint } = applicationConfig
  const [format, setFormat] = useState('html5')
  const [csl, setCsl] = useState('chicagomodified')
  const [toc, setToc] = useState('false')
  const [unnumbered, setUnnumbered] = useState('false')
  const [tld, setTld] = useState('false')
  const exportUrl = book ?
    `${processEndpoint}/cgi-bin/exportBook/exec.cgi?id=${filterAlphaNum(name)}&book=${bookId}&processor=xelatex&source=${exportEndpoint}/&format=${format}&bibstyle=${csl}&toc=${toc}&tld=${tld}&unnumbered=${unnumbered}` :
    `${processEndpoint}/cgi-bin/exportArticle/exec.cgi?id=${filterAlphaNum(title)}v${version}-${revision}&version=${versionId}&processor=xelatex&source=${exportEndpoint}/&format=${format}&bibstyle=${csl}&toc=${toc}`

  return (
    <section className={styles.export}>
      <h1>export</h1>
      <form>
        <Select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="html5">HTML5</option>
          <option value="zip">ZIP</option>
          <option value="pdf">PDF</option>
          <option value="tex">LATEX</option>
          <option value="xml">XML (érudit)</option>
          <option value="odt">ODT</option>
          <option value="docx">DOCX</option>
          <option value="epub">EPUB</option>
          <option value="tei">TEI</option>
          <option value="icml">ICML</option>
        </Select>
        <Select value={csl} onChange={(e) => setCsl(e.target.value)}>
          <option value="chicagomodified">chicagomodified</option>
          <option value="lettres-et-sciences-humaines-fr">
            lettres-et-sciences-humaines-fr
          </option>
          <option value="chicago-fullnote-bibliography-fr">
            chicago-fullnote-bibliography-fr
          </option>
        </Select>
        <Select value={toc} onChange={(e) => setToc(e.target.value)}>
          <option value={true}>Table of content</option>
          <option value={false}>No table of content</option>
        </Select>
        {book && (
          <Select value={unnumbered} onChange={(e) => setUnnumbered(e.target.value)}>
            <option value="false">Section and Chapters: numbered</option>
            <option value="true">Section and Chapters: unnumbered</option>
          </Select>
        )}
        {book && (
          <Select value={tld} onChange={(e) => setTld(e.target.value)}>
            <option value="part">Book division: Part & chapters</option>
            <option value="chapter">Book division: Chapter only</option>
          </Select>
        )}
      </form>
      <nav>
        <p onClick={() => window.open(exportUrl, '_blank')}>Export</p>
      </nav>
    </section>
  )
}

export default connect(mapStateToProps)(Export)
