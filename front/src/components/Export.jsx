import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import slugify from 'slugify'
import useStyloExport from '../hooks/stylo-export.js'
import { applicationConfig } from '../config.js'

import Select from './Select'
import Combobox from './SelectCombobox.jsx'
import Loading from './Loading'
import styles from './export.module.scss'
import buttonStyles from './button.module.scss'
import formStyles from './form.module.scss'

/**
 * @typedef {Object} ExportProps
 * @property {string?} bookId
 * @property {string?} articleVersionId
 * @property {string?} articleId
 * @property {string} bib
 * @property {string} name
 */

/**
 *
 * @param {ExportProps} props
 * @returns {React.ReactElement}
 */
export default function Export(props) {
  const { t } = useTranslation()
  const { bookId, articleVersionId = '', articleId, bib, name } = props
  const { pandocExportHost, pandocExportEndpoint } = applicationConfig

  const [format, setFormat] = useState('html')
  const [csl, setCsl] = useState('chicagomodified')
  const [toc, setToc] = useState('0')
  const [nocite, setNocite] = useState('0')
  const [link_citations, setLinkCitations] = useState('0')
  const [unnumbered, setUnnumbered] = useState('false')
  const [tld, setTld] = useState('false')
  const { exportFormats, exportStyles, exportStylesPreview, isLoading } =
    useStyloExport({ csl, bib })
  const exportId = useMemo(
    () =>
      slugify(name, { strict: true, lower: true }) ||
      (articleVersionId ?? articleId ?? bookId),
    [name]
  )
  const groupedExportStyles = useMemo(() => {
    return exportStyles?.map(({ key, name }, index) => ({
      key,
      name,
      section: '',
      // pre-assign an index to each entry. It will persist upon filtered results.
      // @see https://github.com/EcrituresNumeriques/stylo/issues/1014
      index,
    }))
  }, [exportStyles])

  const exportUrl = useMemo(() => {
    return `${pandocExportEndpoint}/generique/${
      articleId ? 'article' : 'corpus'
    }/export/${pandocExportHost}/${
      articleId ?? bookId
    }/${exportId}/?with_toc=${toc}&with_nocite=${nocite}&with_link_citations=${link_citations}&with_ascii=0&bibliography_style=${csl}&formats=originals&formats=${format}&version=${articleVersionId}`
  }, [toc, csl, format, nocite, link_citations])

  return (
    <section className={styles.export}>
      <form className={clsx(formStyles.form, formStyles.verticalForm)}>
        {!exportFormats.length && <Loading inline size="24" />}
        {exportFormats.length && (
          <Select
            id="export-formats"
            label={t('export.format.label')}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {exportFormats.map(({ key, name }) => (
              <option value={key} key={key}>
                {name}
              </option>
            ))}
          </Select>
        )}

        {bib && !exportStyles.length && <Loading inline size="24" />}
        {bib && exportStyles.length && (
          <Combobox
            id="export-styles"
            label={t('export.bibliography.label')}
            items={groupedExportStyles}
            value={csl}
            onChange={setCsl}
          />
        )}
        {bib && (
          <div className={styles.bibliographyPreview}>
            {isLoading && <Loading inline size="24" />}
            {!isLoading && (
              <div dangerouslySetInnerHTML={{ __html: exportStylesPreview }} />
            )}
          </div>
        )}

        <Select
          label={t('export.toc.label')}
          value={toc}
          onChange={(e) => setToc(parseInt(e.target.value, 10))}
        >
          <option value="1">{t('export.toc.yes')}</option>
          <option value="0">{t('export.toc.no')}</option>
        </Select>

        <Select
          label={t('export.nocite.label')}
          value={nocite}
          onChange={(e) => setNocite(e.target.value)}
        >
          <option value="1">{t('export.nocite.all')}</option>
          <option value="0">{t('export.nocite.onlyUsed')}</option>
        </Select>

        <Select
          label={t('export.linkCitations.label')}
          value={link_citations}
          onChange={(e) => setLinkCitations(e.target.value)}
        >
          <option value="1">{t('export.linkCitations.yes')}</option>
          <option value="0">{t('export.linkCitations.no')}</option>
        </Select>

        {bookId && (
          <Select
            id="export-numbering"
            value={unnumbered}
            onChange={(e) => setUnnumbered(e.target.value)}
          >
            <option value="false">
              {t('export.sectionChapters.numbered')}
            </option>
            <option value="true">
              {t('export.sectionChapters.unnumbered')}
            </option>
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
        <a
          className={clsx(buttonStyles.button, buttonStyles.primary)}
          href={exportUrl}
          rel="noreferrer noopener"
          target="_blank"
          role="button"
        >
          {t('export.submitForm.button')}
        </a>
      </nav>
    </section>
  )
}
