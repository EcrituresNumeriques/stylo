import React, { useMemo, useState } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import slugify from 'slugify'
import useStyloExport from '../hooks/stylo-export.js'

import Select from './Select'
import Combobox from './SelectCombobox.jsx'
import Loading from './Loading'
import styles from './export.module.scss'
import buttonStyles from "./button.module.scss";
import formStyles from "./form.module.scss";

export default function Export ({ bookId, articleVersionId, articleId, bib, name }) {
  const { processEndpoint, exportEndpoint, pandocExportEndpoint } = useSelector(state => state.applicationConfig, shallowEqual)
  const [format, setFormat] = useState(bookId ? 'html5' : 'html')
  const [csl, setCsl] = useState('chicagomodified')
  const [toc, setToc] = useState('0')
  const [unnumbered, setUnnumbered] = useState('false')
  const [tld, setTld] = useState('false')
  const { exportFormats, exportStyles, exportStylesPreview, isLoading } = useStyloExport({ csl, bib })
  const { host } = window.location
  const exportId = useMemo(() => slugify(name, { strict: true, lower: true }) || (articleVersionId ?? articleId ?? bookId), [name])
  const { t } = useTranslation()

  const exportUrl = bookId
    ? `${processEndpoint}/cgi-bin/exportBook/exec.cgi?id=${exportId}&book=${bookId}&processor=xelatex&source=${exportEndpoint}/&format=${format}&bibstyle=${csl}&toc=${Boolean(toc)}&tld=${tld}&unnumbered=${unnumbered}`
    : `${pandocExportEndpoint}/generique/article/export/${host}/${articleId}/${exportId}/?with_toc=${toc}&with_ascii=0&bibliography_style=${csl}&formats=originals&formats=${format}&version=${articleVersionId ?? ''}`

  return (
    <section className={styles.export}>
      <form className={clsx(formStyles.form, formStyles.verticalForm)}>
      {(articleId && !exportFormats.length) && <Loading inline size="24" />}
      {(articleId && exportFormats.length) && <Select id="export-formats" label="Formats" value={format} onChange={(e) => setFormat(e.target.value)}>
        {exportFormats.map(({ key, name }) => <option value={key} key={key}>{ name }</option>)}
        </Select>}
        {bookId && <Select id="export-formats" label={t('export.format.label')} value={format} onChange={(e) => setFormat(e.target.value)}>
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
        </Select>}

        {(articleId && bib && !exportStyles.length) && <Loading inline size="24" />}
        {(articleId && bib && exportStyles.length) && <Combobox id="export-styles" label="Bibliography style" items={exportStyles} value={csl} onChange={setCsl} />}
        {articleId && bib && <div className={styles.bibliographyPreview}>
          {isLoading && <Loading inline size="24" />}
          {!isLoading && <div dangerouslySetInnerHTML={{ __html: exportStylesPreview }} />}
        </div>}

        {bookId && bib && <Select id="export-styles" label="Bibliography style" value={csl} setCsl={setCsl}>
          <option value="chicagomodified">chicagomodified</option>
          <option value="lettres-et-sciences-humaines-fr"> lettres-et-sciences-humaines-fr</option>
          <option value="chicago-fullnote-bibliography-fr"> chicago-fullnote-bibliography-fr</option>
        </Select>}

        <Select id="export-toc" label="Additional options" value={toc} onChange={(e) => setToc(parseInt(e.target.value, 10))}>
          <option value="1">{t('export.additionnalOptions.toc')}</option>
          <option value="0">{t('export.additionnalOptions.notoc')}</option>
        </Select>
        {bookId && (
          <Select id="export-numbering" value={unnumbered} onChange={(e) => setUnnumbered(e.target.value)}>
            <option value="false">{t('export.sectionChapters.numbered')}</option>
            <option value="true">{t('export.sectionChapters.unnumbered')}</option>
          </Select>
        )}
        {bookId && (
          <Select value={tld} onChange={(e) => setTld(e.target.value)}>
            <option value="part">{t('export.bookDivision.part')}</option>
            <option value="chapter">{t('export.bookDivision.chapter')}</option>
          </Select>
        )}
      </form>

      <nav className={styles.actions}>
        <a className={clsx(buttonStyles.button, buttonStyles.primary)} href={exportUrl} rel="noreferrer noopener" target="_blank" role="button">
          {t('export.submitForm.button')}
        </a>
      </nav>
    </section>
  )
}

// TODO use "shapes" to either have bookId, or articleId, or articleId and articleVersionId
Export.propTypes = {
  bookId: PropTypes.string,
  articleVersionId: PropTypes.string,
  articleId: PropTypes.string,
  name: PropTypes.string.isRequired,
  bib: PropTypes.string,
}
