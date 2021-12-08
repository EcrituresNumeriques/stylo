import React, { useState } from 'react'
import { connect } from 'react-redux'

import Select from './Select'
import styles from './export.module.scss'
import buttonStyles from "./button.module.scss";

const mapStateToProps = ({ applicationConfig }) => {
  return { applicationConfig }
}

const Export = ({ bookId, exportId, articleVersionId, applicationConfig }) => {
  const { processEndpoint, exportEndpoint } = applicationConfig
  const [format, setFormat] = useState('html5')
  const [csl, setCsl] = useState('chicagomodified')
  const [toc, setToc] = useState('false')
  const [unnumbered, setUnnumbered] = useState('false')
  const [tld, setTld] = useState('false')
  const exportUrl = bookId ?
    `${processEndpoint}/cgi-bin/exportBook/exec.cgi?id=${exportId}&book=${bookId}&processor=xelatex&source=${exportEndpoint}/&format=${format}&bibstyle=${csl}&toc=${toc}&tld=${tld}&unnumbered=${unnumbered}` :
    `${processEndpoint}/cgi-bin/exportArticle/exec.cgi?id=${exportId}&version=${articleVersionId}&processor=xelatex&source=${exportEndpoint}/&format=${format}&bibstyle=${csl}&toc=${toc}`

  return (
    <section className={styles.export}>
      <h1>Export</h1>
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
          <option value="lettres-et-sciences-humaines-fr"> lettres-et-sciences-humaines-fr</option>
          <option value="chicago-fullnote-bibliography-fr"> chicago-fullnote-bibliography-fr</option>
        </Select>
        <Select value={toc} onChange={(e) => setToc(e.target.value)}>
          <option value={true}>Table of content</option>
          <option value={false}>No table of content</option>
        </Select>
        {bookId && (
          <Select value={unnumbered} onChange={(e) => setUnnumbered(e.target.value)}>
            <option value="false">Section and Chapters: numbered</option>
            <option value="true">Section and Chapters: unnumbered</option>
          </Select>
        )}
        {bookId && (
          <Select value={tld} onChange={(e) => setTld(e.target.value)}>
            <option value="part">Book division: Part & chapters</option>
            <option value="chapter">Book division: Chapter only</option>
          </Select>
        )}
      </form>
      <nav>
        <a className={[buttonStyles.button, buttonStyles.primary].join(' ')} href={exportUrl} target="_blank">Export</a>
      </nav>
    </section>
  )
}

export default connect(mapStateToProps)(Export)
