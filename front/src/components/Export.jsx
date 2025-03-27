import clsx from 'clsx'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import slugify from 'slugify'
import { applicationConfig } from '../config.js'
import useStyloExport from '../hooks/stylo-export.js'
import Button from './Button.jsx'
import buttonStyles from './button.module.scss'
import styles from './export.module.scss'
import formStyles from './form.module.scss'
import Loading from './molecules/Loading.jsx'

import Select from './Select'
import Combobox from './SelectCombobox.jsx'

/**
 * @param {object} props
 * @param {string?} props.bookId
 * @param {string?} props.articleVersionId
 * @param {string?} props.articleId
 * @param {string} props.bib
 * @param {string} props.name
 * @param {() => {}} props.onCancel
 * @returns {React.ReactElement}
 */
export default function Export({
  bookId,
  articleVersionId = '',
  articleId,
  bib,
  name,
  onCancel,
}) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { pandocExportHost, pandocExportEndpoint } = applicationConfig

  const {
    bibliography_style,
    with_toc,
    link_citations,
    with_nocite,
    formats,
    unnumbered,
    book_division,
  } = useSelector((state) => state.exportPreferences, shallowEqual)

  const setPreference = useCallback(
    /** @param {string} key */ (key) =>
      /** @param {string|Event} event */ (event) =>
        dispatch({
          type: 'SET_EXPORT_PREFERENCES',
          key,
          value: event?.target?.value ?? event,
        }),
    []
  )

  const { exportFormats, exportStyles, exportStylesPreview, isLoading } =
    useStyloExport({ bibliography_style, bib })

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
    }/${exportId}/?with_toc=${with_toc}&with_nocite=${with_nocite}&with_link_citations=${link_citations}&with_ascii=0&bibliography_style=${bibliography_style}&formats=originals&formats=${formats}&version=${articleVersionId}`
  }, [with_toc, bibliography_style, formats, with_nocite, link_citations])

  return (
    <>
      <section className={styles.export}>
        <form className={formStyles.form}>
          {!exportFormats.length && <Loading size="1.5rem" />}
          {exportFormats.length && (
            <Select
              id="export-formats"
              label={t('export.format.label')}
              value={formats}
              onChange={setPreference('formats')}
            >
              {exportFormats.map(({ key, name }) => (
                <option value={key} key={key}>
                  {name}
                </option>
              ))}
            </Select>
          )}

          {bib && !exportStyles.length && <Loading inline size="1.5rem" />}
          {bib && exportStyles.length && (
            <Combobox
              id="export-styles"
              label={t('export.bibliography.label')}
              items={groupedExportStyles}
              value={bibliography_style}
              onChange={setPreference('bibliography_style')}
            />
          )}
          {bib && (
            <div className={styles.bibliographyPreview}>
              {isLoading && <Loading inline size="1.5rem" />}
              {!isLoading && (
                <div
                  dangerouslySetInnerHTML={{ __html: exportStylesPreview }}
                />
              )}
            </div>
          )}

          <Select
            label={t('export.toc.label')}
            value={with_toc}
            onChange={setPreference('with_toc')}
          >
            <option value="1">{t('export.toc.yes')}</option>
            <option value="0">{t('export.toc.no')}</option>
          </Select>

          <Select
            label={t('export.nocite.label')}
            value={with_nocite}
            onChange={setPreference('with_nocite')}
          >
            <option value="1">{t('export.nocite.all')}</option>
            <option value="0">{t('export.nocite.onlyUsed')}</option>
          </Select>

          <Select
            label={t('export.linkCitations.label')}
            value={link_citations}
            onChange={setPreference('link_citations')}
          >
            <option value="1">{t('export.linkCitations.yes')}</option>
            <option value="0">{t('export.linkCitations.no')}</option>
          </Select>

          {/*bookId && (
          <Select
            id="export-numbering"
            value={unnumbered}
            onChange={setPreference('unnumbered')}
          >
            <option value="false">
              {t('export.sectionChapters.numbered')}
            </option>
            <option value="true">
              {t('export.sectionChapters.unnumbered')}
            </option>
          </Select>
        )*/}
          {/*bookId && (
          <Select
            value={book_division}
            onChange={setPreference('book_division')}
          >
            <option value="part">{t('export.bookDivision.part')}</option>
            <option value="chapter">{t('export.bookDivision.chapter')}</option>
          </Select>
        )*/}
        </form>
      </section>
      <footer className={styles.actions}>
        {onCancel && (
          <Button
            aria-label={t('modal.cancelButton.label')}
            secondary={true}
            onClick={() => onCancel()}
          >
            {t('modal.cancelButton.text')}
          </Button>
        )}
        <a
          className={clsx(buttonStyles.button, buttonStyles.primary)}
          href={exportUrl}
          rel="noreferrer noopener"
          target="_blank"
          role="button"
        >
          {t('export.submitForm.button')}
        </a>
      </footer>
    </>
  )
}
